import { describe, it, expect } from 'vitest';
import { capLength, claimScore, mergeShort, normalize, segmentTranscript, splitSentences, stripFillers, suggestTopic } from './segment';

const TRANSCRIPT = `
[00:12] Host: Welcome back. Um, so today we're talking about how the wealthy never pay taxes.
Guest: Yeah. Right. So basically if you put your house in an LLC, creditors can never touch it. That's just the law.
Host: Wow.
Guest: And a Wyoming LLC is completely anonymous, nobody can find out what you own, not even the IRS.
Guest: Whole life insurance is a tax-free bank. You borrow against the cash value and you never have to pay it back.
Host: Is that really true?
Guest: 100%. Also, loans between your companies mean you don't pay tax on the money. I remember when I first heard that.
[Music]
Guest: A family bank lets you lend to your kids at 0% interest with zero gift tax. The AFR doesn't matter.
`;

describe('normalize', () => {
  it('strips timestamps, speaker labels and stage directions', () => {
    const n = normalize('[00:12] Host: Hello there.\n[Music]\nGuest: Second line.');
    expect(n).toBe('Hello there.\nSecond line.');
  });
});

describe('splitSentences', () => {
  it('splits on terminal punctuation followed by a capital, and on line breaks', () => {
    expect(splitSentences('First one. Second one! Third one? "Fourth."')).toEqual(['First one.', 'Second one!', 'Third one?', '"Fourth."']);
    expect(splitSentences('A line\nAnother line')).toEqual(['A line', 'Another line']);
  });
  it('does not split on decimals or section symbols', () => {
    expect(splitSentences('The rate is 2.5 percent under §7872. It applies.')).toEqual(['The rate is 2.5 percent under §7872.', 'It applies.']);
  });
});

describe('stripFillers', () => {
  it('removes verbal fillers', () => {
    const out = stripFillers('Um, so basically trusts avoid probate, you know.');
    expect(out).not.toMatch(/\bum\b|basically|you know/i);
    expect(out).toMatch(/trusts avoid probate/);
  });
});

describe('claimScore', () => {
  it('returns 0 for fragments and questions', () => {
    expect(claimScore('Wow.')).toBe(0);
    expect(claimScore('Is that really true?')).toBe(0);
    expect(claimScore('Yeah so')).toBe(0);
  });
  it('scores assertive domain sentences higher than narrative', () => {
    const claim = claimScore('An irrevocable trust means you lose all control and never pay estate tax.');
    const story = claimScore('I remember when I first drove across the state to see my grandmother.');
    expect(claim).toBeGreaterThan(story);
    expect(claim).toBeGreaterThanOrEqual(4);
  });
});

describe('suggestTopic', () => {
  it('maps domain keywords to topics', () => {
    expect(suggestTopic('Put your house in an LLC to protect it from creditors')).toBe('asset-protection');
    expect(suggestTopic('A Wyoming LLC is anonymous and the operating agreement is private')).toBe('entity-structuring');
    expect(suggestTopic('Whole life insurance is a tax-free bank with policy loans')).toBe('insurance');
    expect(suggestTopic('Offshore trusts in the Cook Islands hide money')).toBe('offshore');
    expect(suggestTopic('A family bank lets you lend to your kids at the AFR')).toBe('family-banking');
    expect(suggestTopic('Cost segregation accelerates depreciation on rental real estate')).toBe('real-estate');
    expect(suggestTopic('The family council and family constitution set governance')).toBe('governance');
    expect(suggestTopic('Our single family office hired a CIO')).toBe('family-office');
    expect(suggestTopic('A HELOC is good debt if you use leverage carefully')).toBe('debt-credit');
    expect(suggestTopic('Probate and inheritance for the heirs')).toBe('succession');
    expect(suggestTopic('The trustee of the irrevocable trust')).toBe('trusts');
    expect(suggestTopic('Capital gains tax and the step-up loophole')).toBe('tax');
    expect(suggestTopic('The weather was lovely')).toBeUndefined();
  });
});

describe('mergeShort / capLength', () => {
  it('merges short sentences with the next and caps long ones at a word boundary', () => {
    expect(mergeShort(['That is wrong.', 'Trusts avoid probate for funded assets.'], 45)).toEqual(['That is wrong. Trusts avoid probate for funded assets.']);
    const long = 'word '.repeat(100).trim();
    const capped = capLength(long, 50);
    expect(capped.length).toBeLessThanOrEqual(51);
    expect(capped.endsWith('…')).toBe(true);
  });
});

describe('segmentTranscript', () => {
  it('is deterministic and returns unverified candidates with topics', () => {
    const a = segmentTranscript(TRANSCRIPT);
    const b = segmentTranscript(TRANSCRIPT);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(5);
    for (const c of a) {
      expect(c.confidenceHint).toBe('unverified');
      expect(c.text.length).toBeGreaterThanOrEqual(30);
      expect(c.text.length).toBeLessThanOrEqual(321);
      expect(c.text).not.toMatch(/\[00:12\]|Host:|Guest:/);
    }
  });
  it('drops fillers, fragments and questions and keeps the popular claims', () => {
    const texts = segmentTranscript(TRANSCRIPT).map((c) => c.text);
    expect(texts.some((t) => /house in an LLC/i.test(t))).toBe(true);
    expect(texts.some((t) => /Wyoming LLC/i.test(t))).toBe(true);
    expect(texts.some((t) => /Whole life insurance/i.test(t))).toBe(true);
    expect(texts.some((t) => /family bank/i.test(t))).toBe(true);
    expect(texts.some((t) => /^Wow\.?$/.test(t))).toBe(false);
    expect(texts.some((t) => /Is that really true\?/.test(t))).toBe(false);
  });
  it('assigns sensible topics to the popular claims', () => {
    const cands = segmentTranscript(TRANSCRIPT);
    const find = (re: RegExp) => cands.find((c) => re.test(c.text));
    expect(find(/Whole life/i)?.topic).toBe('insurance');
    expect(find(/family bank/i)?.topic).toBe('family-banking');
    expect(find(/Wyoming LLC/i)?.topic).toBe('entity-structuring');
  });
  it('returns an empty array for empty or non-claim input', () => {
    expect(segmentTranscript('')).toEqual([]);
    expect(segmentTranscript('Hi. Thanks. Okay.')).toEqual([]);
  });
});
