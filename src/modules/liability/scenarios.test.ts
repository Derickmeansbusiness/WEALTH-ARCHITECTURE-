import { describe, it, expect } from 'vitest';
import { SCENARIOS, DEFAULT_FACTS, scorecard } from './scenarios';
import { nodeById } from './structure';

describe('liability scenarios', () => {
  it('every step references real nodes', () => {
    for (const sc of SCENARIOS) {
      for (const st of sc.build(DEFAULT_FACTS)) {
        expect(nodeById[st.from], `${sc.id}/${st.id} from`).toBeDefined();
        expect(nodeById[st.to], `${sc.id}/${st.id} to`).toBeDefined();
      }
    }
  });
  it('a well-run structure protects the rentals from a tenant judgment beyond rental #1', () => {
    const sc = scorecard(SCENARIOS[0].build(DEFAULT_FACTS));
    expect(sc.rental1).toBe('exposed');
    expect(sc.rental2).toBe('protected');
    expect(sc.brokerage).toBe('protected');
  });
  it('commingling breaches the tenant scenario', () => {
    const sc = scorecard(SCENARIOS[0].build({ ...DEFAULT_FACTS, commingled: true }));
    expect(sc.bank).toBe('exposed');
    expect(sc.rental2).toBe('exposed');
  });
  it('a weak charging-order state exposes the holding structure to a personal creditor', () => {
    const personal = SCENARIOS.find((s) => s.id === 'personal')!;
    expect(scorecard(personal.build(DEFAULT_FACTS)).brokerage).toBe('protected');
    expect(scorecard(personal.build({ ...DEFAULT_FACTS, weakChargingOrder: true })).brokerage).toBe('exposed');
  });
  it('late transfers expose the ILIT in bankruptcy', () => {
    const bk = SCENARIOS.find((s) => s.id === 'bankruptcy')!;
    expect(scorecard(bk.build(DEFAULT_FACTS)).life).toBe('protected');
    expect(scorecard(bk.build({ ...DEFAULT_FACTS, lateTransfer: true })).life).toBe('exposed');
  });
});
