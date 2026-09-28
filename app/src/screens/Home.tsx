import type { Plan } from '../lib/planner';
import type { Streak } from '../lib/progress';
import { BandRoadmap, Button, RecoveryNotice, StartButton, StreakMeter } from '../ui/ds';

export function Home(props: {
  plan: Plan;
  persistent: boolean;
  sentences: number;
  streak: Streak;
  cue: string;
  contentLeft: boolean;
  onStart(): void;
  onSettings(): void;
}) {
  const { plan } = props;
  const nothing = plan.reviewIds.length === 0 && plan.newFamilyIds.length === 0;
  const backBy = plan.backOnTrackDays
    ? new Date(Date.now() + plan.backOnTrackDays * 86_400_000).toLocaleDateString('en-GB', { weekday: 'long' })
    : '';

  return (
    <main className="screen home">
      <header className="home-top">
        <span className="wordmark" lang="de">Satz</span>
        <Button variant="text" onClick={props.onSettings}>Settings</Button>
      </header>

      <section className="home-main">
        {plan.mode === 'recovery' ? (
          <RecoveryNotice date={backBy}>
            <StartButton minutes={plan.estMin} onClick={props.onStart} />
          </RecoveryNotice>
        ) : nothing ? (
          <div className="home-done">
            <p className="home-title">Nothing due today.</p>
            <p className="muted">
              {props.contentLeft
                ? 'Your new sentences for today are done. Tomorrow brings the next ones.'
                : 'You have reached the end of the sentences available so far. Reviews continue as they come due.'}
            </p>
          </div>
        ) : (
          <>
            <StartButton minutes={plan.estMin} onClick={props.onStart} />
            {props.cue && <p className="muted home-cue">When {props.cue}, I do today's session.</p>}
          </>
        )}
      </section>

      {!props.persistent && <p className="notice">This browser window can't save your progress, so it will reset when you close it. Open the app in a normal (not private) window to keep it.</p>}

      <StreakMeter days={props.streak.days} freezes={props.streak.freezes} week={props.streak.week} />
      <BandRoadmap sentences={props.sentences} />
    </main>
  );
}
