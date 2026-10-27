import type { Topic } from '@/types/knowledge';

/**
 * Deterministic claim segmentation for pasted transcripts.
 * Pure functions, no randomness, no network. Tested in segment.test.ts.
 */

export interface CandidateClaim {
  text: string;
  topic?: Topic;
  /** Everything produced here is unverified by definition. */
  confidenceHint: 'unverified';
  /** Claim-likeness score (higher = more assertive / more domain signal). */
  score: number;
}

export interface SegmentOptions {
  /** Minimum claim-likeness score to keep a sentence. */
  minScore?: number;
  /** Sentences shorter than this (chars) are merged with the next sentence. */
  mergeBelow?: number;
  /** Sentences shorter than this (chars) after merging are dropped as fragments. */
  minLength?: number;
  /** Maximum output length per candidate (chars). */
  maxLength?: number;
  /** Maximum number of candidates returned. */
  limit?: number;
}

const DEFAULTS: Required<SegmentOptions> = { minScore: 2, mergeBelow: 45, minLength: 30, maxLength: 320, limit: 200 };

const FILLERS = /\b(um+|uh+|erm|you know|i mean|like,|kind of|sort of|basically|literally|right\?|okay so|so yeah|yeah so|anyway)\b[,]?\s*/gi;
const FRAGMENT = /^(yeah|yes|no|okay|ok|right|exactly|sure|wow|hmm+|thanks?|thank you|hi|hello|welcome back|let's go|all right|alright)[.!?]*$/i;
const TIMESTAMP = /\[?\b\d{1,2}:\d{2}(?::\d{2})?\b\]?/g;
const SPEAKER = /^(?:[A-Z][\w .'-]{0,30}|speaker \d+|host|guest):\s+/i;

/** Assertive / modal verbs and absolute language that mark a sentence as a claim. */
const CLAIM_SIGNALS: { re: RegExp; w: number }[] = [
  { re: /\b(never|always|every|everyone|nobody|no one|all|zero|guaranteed?|100%|completely|totally|untouchable|bulletproof)\b/i, w: 2 },
  { re: /\b(legally|lawfully|the law says|by law|the irs|the government|the court|statute|code|section|§)\b/i, w: 2 },
  { re: /\b(will|can|cannot|can't|won't|must|should|means|allows?|lets?|makes?|eliminates?|avoids?|protects?|hides?|shields?|removes?|saves?|deducts?|defers?|pays?|owes?)\b/i, w: 1 },
  { re: /\b(tax(es|able|ation)?|tax[- ]free|write[- ]?off|deduct(ion|ible)?|loophole|capital gains|income|depreciation|step[- ]up|estate tax|gift tax|payroll)\b/i, w: 2 },
  { re: /\b(trust|trusts|trustee|irrevocable|revocable|dynasty|dapt|spendthrift|protector|grantor)\b/i, w: 2 },
  { re: /\b(llc|llcs|s[- ]corp|c[- ]corp|corporation|holding company|series llc|entity|entities|charging order|veil)\b/i, w: 2 },
  { re: /\b(the wealthy|rich people|the rich|wealthy (people|families)|billionaires?|millionaires?|the 1%|ultra[- ]rich)\b/i, w: 2 },
  { re: /\b(offshore|cook islands|nevis|cayman|dubai|uae|wyoming|delaware|nevada|south dakota|switzerland|singapore)\b/i, w: 1 },
  { re: /\b(loan|loans|borrow(ing)?|debt|mortgage|interest|credit|leverage|lender|promissory)\b/i, w: 1 },
  { re: /\b(insurance|whole life|policy|premium|infinite banking|cash value)\b/i, w: 1 },
  { re: /\b(inherit(ance)?|heirs?|succession|probate|estate|will|generation)\b/i, w: 1 },
  { re: /\$\s?\d|\b\d+(\.\d+)?\s?%|\b\d{1,3}(,\d{3})+\b/, w: 1 },
];

/** Keyword weights per topic. Scores are summed; highest wins; ties resolve by listed order. */
const TOPIC_KEYWORDS: { topic: Topic; words: [RegExp, number][] }[] = [
  { topic: 'entity-structuring', words: [[/\bllcs?\b/i, 3], [/\bs[- ]corp/i, 3], [/\bc[- ]corp/i, 2], [/\bholding (company|co)\b/i, 3], [/\bseries llc/i, 3], [/\bcorporation\b/i, 2], [/\bentity|entities\b/i, 2], [/\boperating agreement/i, 2], [/\bwyoming|delaware|nevada\b/i, 1], [/\banonymous|anonymity|registered agent/i, 2], [/\bveil\b/i, 2]] },
  { topic: 'trusts', words: [[/\btrusts?\b/i, 3], [/\btrustee/i, 3], [/\birrevocable|revocable\b/i, 3], [/\bdynasty\b/i, 2], [/\bgrantor\b/i, 2], [/\bprotector\b/i, 2], [/\bbeneficiar/i, 2], [/\bliving trust/i, 3]] },
  { topic: 'tax', words: [[/\btax(es|able|ation)?\b/i, 2], [/\btax[- ]free\b/i, 2], [/\bdeduct/i, 2], [/\bwrite[- ]?off/i, 2], [/\bcapital gains\b/i, 2], [/\bloophole/i, 2], [/\bthe irs\b/i, 2], [/\bstep[- ]up\b/i, 2], [/\bbuy,? borrow,? die/i, 3], [/\bpayroll tax|self[- ]employment tax/i, 2], [/\b1031\b/, 2]] },
  { topic: 'insurance', words: [[/\binsurance\b/i, 3], [/\bwhole life|universal life|term life\b/i, 3], [/\bpolicy (loan|loans)\b/i, 3], [/\bcash value\b/i, 3], [/\binfinite banking|be your own bank/i, 3], [/\bpremiums?\b/i, 2], [/\bumbrella\b/i, 2], [/\bilit\b/i, 3]] },
  { topic: 'real-estate', words: [[/\breal estate\b/i, 3], [/\brental|rentals|landlord|tenant/i, 2], [/\bdepreciation\b/i, 3], [/\bcost segregation\b/i, 3], [/\b1031\b/, 2], [/\bproperty|properties\b/i, 1], [/\bhouse|home\b/i, 1], [/\bmortgage\b/i, 1], [/\breal estate professional/i, 3]] },
  { topic: 'family-banking', words: [[/\bfamily bank(ing)?\b/i, 4], [/\blend(ing)? to (your|my|the) (kids|children|family)/i, 3], [/\bintra[- ]family\b/i, 3], [/\bafr\b|applicable federal rate/i, 3], [/\bpromissory note\b/i, 2], [/\bloan to (my|your|the) (son|daughter|kids|children)/i, 3], [/\bfamily loan/i, 3]] },
  { topic: 'asset-protection', words: [[/\basset protection\b/i, 4], [/\bcreditors?\b/i, 3], [/\blawsuits?|sued|judgment\b/i, 2], [/\bcharging order\b/i, 3], [/\bdapt\b/i, 3], [/\bprotect(s|ed|ing)? (your|my) (assets|wealth|money)\b/i, 3], [/\bbulletproof|untouchable|judgment[- ]proof/i, 2], [/\bfraudulent transfer/i, 3]] },
  { topic: 'offshore', words: [[/\boffshore\b/i, 4], [/\bcook islands|nevis|cayman|belize|bvi|bermuda|jersey|guernsey|isle of man\b/i, 3], [/\bdubai|uae|abu dhabi|difc|adgm\b/i, 3], [/\bswitzerland|swiss|singapore|liechtenstein\b/i, 2], [/\bforeign trust\b/i, 3], [/\bfbar|3520\b/i, 3], [/\btax haven/i, 3]] },
  { topic: 'succession', words: [[/\bsuccession\b/i, 3], [/\binherit(ance)?\b/i, 3], [/\bheirs?\b/i, 2], [/\bestate (tax|plan|planning)\b/i, 3], [/\bprobate\b/i, 3], [/\bgift(ing|s)?\b/i, 2], [/\bwill\b(?! (be|not|never|always))/i, 1], [/\bnext generation|generations?\b/i, 1], [/\bstep[- ]up/i, 1]] },
  { topic: 'governance', words: [[/\bgovernance\b/i, 4], [/\bfamily (council|constitution|charter|meeting|assembly)\b/i, 4], [/\bvalues|mission\b/i, 1], [/\bdecision[- ]making\b/i, 2], [/\bconflict\b/i, 1], [/\bshirtsleeves/i, 3], [/\bthird generation\b/i, 2]] },
  { topic: 'family-office', words: [[/\bfamily office\b/i, 4], [/\bsingle[- ]family office|multi[- ]family office|sfo|mfo\b/i, 4], [/\bchief investment officer|cio\b/i, 2], [/\binvestment (committee|policy)\b/i, 2], [/\blender management/i, 3]] },
  { topic: 'debt-credit', words: [[/\bdebt\b/i, 3], [/\bborrow(ing|ed)?\b/i, 2], [/\bloans?\b/i, 2], [/\bcredit (score|line|card)s?\b/i, 3], [/\bleverage\b/i, 3], [/\binterest rate|interest\b/i, 2], [/\bmortgage|refinanc/i, 2], [/\bheloc|line of credit\b/i, 3], [/\bdscr|ltv|debt service\b/i, 3], [/\bgood debt|bad debt\b/i, 3], [/\bbackdat/i, 2]] },
];

/** Normalise whitespace, strip timestamps, speaker labels and bracketed stage directions. */
export function normalize(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(TIMESTAMP, ' ')
    .replace(/\[(music|applause|laughter|inaudible|crosstalk)[^\]]*\]/gi, ' ')
    .split('\n')
    .map((line) => line.replace(SPEAKER, '').trim())
    .filter(Boolean)
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Split normalised text into sentences on terminal punctuation or line breaks. */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    // Split after . ! ? (optionally followed by quotes/brackets) when followed by whitespace + capital/quote/digit, or at end.
    const parts = line.split(/(?<=[.!?]["')\]]?)\s+(?=["'(\[]?[A-Z0-9])/);
    for (const p of parts) {
      const t = p.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

/** Remove verbal fillers; returns the cleaned sentence. */
export function stripFillers(s: string): string {
  return s.replace(FILLERS, '').replace(/\s{2,}/g, ' ').replace(/^[,;\s]+/, '').trim();
}

/** Score how claim-like a sentence is. 0 = not a claim. */
export function claimScore(s: string): number {
  if (!s || FRAGMENT.test(s.trim())) return 0;
  if (/\?\s*$/.test(s)) return 0; // questions are not claims
  const words = s.split(/\s+/).length;
  if (words < 5) return 0;
  let score = 0;
  for (const { re, w } of CLAIM_SIGNALS) if (re.test(s)) score += w;
  // First-person narrative ("I went to…") is weaker than general assertion.
  if (/^(i|we)\s+(went|was|were|had|remember|think|feel)\b/i.test(s)) score -= 1;
  return Math.max(0, score);
}

/** Suggest the best-matching topic, or undefined when nothing scores. */
export function suggestTopic(s: string): Topic | undefined {
  let best: { topic: Topic; score: number } | undefined;
  for (const { topic, words } of TOPIC_KEYWORDS) {
    let score = 0;
    for (const [re, w] of words) if (re.test(s)) score += w;
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic;
}

/** Trim to maxLength at a word boundary, appending an ellipsis. */
export function capLength(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const at = Math.max(cut.lastIndexOf(' '), Math.floor(max * 0.6));
  return `${cut.slice(0, at).replace(/[,;:\s]+$/, '')}…`;
}

/** Merge very short sentences into their successor so "That's wrong. Trusts avoid probate." stays together. */
export function mergeShort(sentences: string[], below: number): string[] {
  const out: string[] = [];
  let buffer = '';
  for (const s of sentences) {
    if (buffer) { buffer = `${buffer} ${s}`; }
    else buffer = s;
    if (buffer.length >= below) { out.push(buffer); buffer = ''; }
  }
  if (buffer) out.push(buffer);
  return out;
}

export function segmentTranscript(raw: string, options: SegmentOptions = {}): CandidateClaim[] {
  const o = { ...DEFAULTS, ...options };
  const sentences = splitSentences(normalize(raw)).map(stripFillers).filter((s) => s && !FRAGMENT.test(s));
  const merged = mergeShort(sentences, o.mergeBelow).filter((s) => s.length >= o.minLength);
  const out: CandidateClaim[] = [];
  const seen = new Set<string>();
  for (const s of merged) {
    const score = claimScore(s);
    if (score < o.minScore) continue;
    const text = capLength(s, o.maxLength);
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text, topic: suggestTopic(text), confidenceHint: 'unverified', score });
    if (out.length >= o.limit) break;
  }
  return out;
}
