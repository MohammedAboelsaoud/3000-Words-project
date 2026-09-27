import { describe, expect, it } from 'vitest';
import { streak } from '../progress';

const day = (m: number) => ({ ms: m * 60_000, completed: false });

describe('streak', () => {
  it('counts consecutive days and spends a freeze on a missed day', () => {
    // Monday 2026-09-21 … today Friday 2026-09-25; Wednesday missed.
    const s = streak({ '2026-09-21': day(10), '2026-09-22': day(10), '2026-09-24': day(6) }, new Date(2026, 8, 25, 8));
    expect(s.days).toBe(3);
    expect(s.freezes).toBe(1);
    expect(s.week).toEqual(['done', 'done', 'frozen', 'done', 'today', 'future', 'future']);
  });
  it('restarts after freezes run out', () => {
    const s = streak({ '2026-09-14': day(10), '2026-09-24': day(10) }, new Date(2026, 8, 25, 8));
    expect(s.days).toBe(1);
    expect(s.freezes).toBe(0);
  });
  it('a 3-minute day does not count unless everything was done', () => {
    expect(streak({ '2026-09-25': day(3) }, new Date(2026, 8, 25, 20)).days).toBe(0);
    expect(streak({ '2026-09-25': { ms: 180_000, completed: true } }, new Date(2026, 8, 25, 20)).days).toBe(1);
  });
});
