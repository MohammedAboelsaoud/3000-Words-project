import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { makeScheduler, newTrace, review } from '../scheduler';
import { Store } from '../store';

describe('Store', () => {
  it('commits reviews to an append-only log and round-trips a backup', async () => {
    const store = await Store.open('test-' + Math.random());
    const f = makeScheduler();
    const now = new Date();
    const r = review(f, newTrace('de-0001', 'comprehension', now), 'again', now, { durationMs: 5000, format: 'intro' });
    await store.commitReview([r.trace], r.log);
    const loaded = await store.load();
    expect(loaded.traces).toHaveLength(1);
    expect(loaded.traces[0].card.due).toBeInstanceOf(Date);
    expect(loaded.log[0].format).toBe('intro');
    expect(loaded.settings.budgetMin).toBe(30);

    const backup = JSON.parse(JSON.stringify(await store.exportAll()));
    const other = await Store.open('test-' + Math.random());
    await other.importAll(backup);
    const again = await other.load();
    expect(again.traces[0].card.due).toBeInstanceOf(Date);
    expect(again.log[0].reviewedAt).toBeInstanceOf(Date);
  });
});
