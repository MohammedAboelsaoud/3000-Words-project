/* @ds-bundle: {"format":4,"namespace":"Satz","components":[{"name":"StartButton"},{"name":"Button"},{"name":"AudioButton"},{"name":"SlotText"},{"name":"SentenceCard"},{"name":"AlignmentStrip"},{"name":"FamilyList"},{"name":"ChangePair"},{"name":"RuleCard"},{"name":"TaskHeader"},{"name":"ChoiceOption"},{"name":"DictationDiff"},{"name":"SpeakFeedback"},{"name":"SelfGrade"},{"name":"GradeChip"},{"name":"BandRoadmap"},{"name":"SessionClose"},{"name":"StreakMeter"},{"name":"RecoveryNotice"},{"name":"EvidenceTag"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var F = React.Fragment;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }
  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // "[...]" marks the one slot that changes / the new chunk.
  function parseSlots(text) {
    var out = [], re = /\[([^\]]+)\]/g, last = 0, m;
    text = text || '';
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ t: text.slice(last, m.index) });
      out.push({ t: m[1], slot: true });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ t: text.slice(last) });
    return out;
  }

  function SlotText(props) {
    return h(F, null, parseSlots(props.text).map(function (p, i) {
      return p.slot && props.highlight !== false
        ? h('mark', { key: i, className: 'sz-slot' }, p.t)
        : h(F, { key: i }, p.t);
    }));
  }

  // ---- Actions ---------------------------------------------------------
  function StartButton(props) {
    var label = props.label || 'Start';
    return h('button', {
      type: 'button', className: cx('sz-start', props.className), onClick: props.onClick, disabled: props.disabled
    }, h('span', null, label), props.minutes != null && h('span', { className: 'sz-start-min' }, '· ' + props.minutes + ' min'));
  }

  function Button(props) {
    var variant = props.variant || 'quiet';
    var rest = Object.assign({}, props);
    delete rest.variant; delete rest.className;
    return h('button', Object.assign({ type: 'button' }, rest, { className: cx('sz-btn', 'sz-btn-' + variant, props.className) }), props.children);
  }

  function AudioButton(props) {
    var speed = props.speed || 'natural';
    var label = props.playing ? 'Pause' : (speed === 'slow' ? 'Play slowly' : 'Play');
    return h('div', { className: 'sz-audio' },
      h('button', { type: 'button', className: cx('sz-audio-disc', speed === 'slow' && 'sz-audio-slow'), 'aria-label': label, 'aria-pressed': !!props.playing, onClick: props.onClick },
        h('span', { 'aria-hidden': true, className: props.playing ? 'sz-glyph-pause' : 'sz-glyph-play' })),
      h('span', { className: 'sz-audio-meta' },
        h('span', { className: 'sz-audio-speed' }, speed === 'slow' ? 'Slow' : 'Natural'),
        props.voice && h('span', { className: 'sz-audio-voice' }, props.voice)));
  }

  // ---- Sentence --------------------------------------------------------
  function SentenceCard(props) {
    var glossDir = props.glossDir || 'ltr';
    return h('article', { className: cx('sz-card', props.className), lang: props.lang || 'de' },
      (props.band || props.theme) && h('div', { className: 'sz-card-meta' }, [props.band, props.theme].filter(Boolean).join(' · ')),
      props.media && h('div', { className: 'sz-card-media' }, props.media),
      props.hidden
        ? h('p', { className: 'sz-card-hidden' }, 'Listen first — the text appears after your guess.')
        : h('p', { className: 'sz-sentence-lg' }, h(SlotText, { text: props.text })),
      !props.hidden && props.gloss && h('p', { className: 'sz-gloss', dir: glossDir, lang: props.glossLang || 'en' }, props.gloss),
      props.audio && h('div', { className: 'sz-card-audio' }, props.audio),
      props.children);
  }

  function AlignmentStrip(props) {
    var tokens = props.tokens || [];
    var dir = props.glossDir || 'ltr';
    return h('figure', { className: 'sz-strip' },
      h('div', { className: 'sz-strip-grid', style: { gridTemplateColumns: 'repeat(' + tokens.length + ', auto)' } },
        tokens.map(function (t, i) {
          return h('span', { key: 'd' + i, lang: 'de', className: cx('sz-strip-de', t.mark === 'slot' && 'sz-slot', t.mark === 'none' && 'sz-strip-none', t.mark === 'moves' && 'sz-strip-moves') }, t.de);
        }),
        tokens.map(function (t, i) {
          return h('span', { key: 'g' + i, dir: dir, lang: props.glossLang || 'en', className: 'sz-strip-gl' }, t.mark === 'none' && !t.gloss ? '—' : t.gloss);
        })),
      props.note && h('figcaption', { className: 'sz-strip-note' }, props.note));
  }

  function FamilyList(props) {
    return h('div', { className: 'sz-family' },
      props.frame && props.revealed && h('p', { className: 'sz-family-frame' }, 'Same in every line: ', h('strong', { lang: 'de' }, props.frame)),
      h('ol', { className: 'sz-family-list', lang: 'de' },
        (props.sentences || []).map(function (s, i) {
          return h('li', { key: i, className: 'sz-sentence' }, h(SlotText, { text: s, highlight: !!props.revealed }));
        })));
  }

  function ChangePair(props) {
    return h('div', { className: 'sz-pair' },
      h('div', { className: 'sz-pair-row' }, h('span', { className: 'sz-pair-k' }, 'A'), h('p', { className: 'sz-sentence', lang: 'de' }, h(SlotText, { text: props.a }))),
      h('div', { className: 'sz-pair-row' }, h('span', { className: 'sz-pair-k' }, 'B'), h('p', { className: 'sz-sentence', lang: 'de' }, h(SlotText, { text: props.b }))),
      props.note && h('p', { className: 'sz-pair-note' }, props.note));
  }

  function RuleCard(props) {
    return h('aside', { className: 'sz-rule' },
      h('span', { className: 'sz-rule-k' }, 'Rule'),
      h('p', { className: 'sz-rule-frame', lang: 'de' }, props.frame),
      h('p', { className: 'sz-rule-line' }, props.rule));
  }

  // ---- Exercise --------------------------------------------------------
  function TaskHeader(props) {
    var pct = props.progress != null ? Math.max(0, Math.min(1, props.progress)) : null;
    return h('header', { className: 'sz-task' },
      pct != null && h('div', { className: 'sz-task-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(pct * 100), 'aria-label': 'Session progress' },
        h('span', { style: { width: (pct * 100) + '%' } })),
      h('p', { className: 'sz-task-do' }, props.instruction),
      props.reason && props.showReason !== false && h('p', { className: 'sz-task-why' }, props.reason));
  }

  var CHOICE_WORD = { correct: 'Correct', wrong: 'Not this one' };
  function ChoiceOption(props) {
    var state = props.state || 'idle';
    return h('button', {
      type: 'button', className: cx('sz-choice', 'sz-choice-' + state), dir: props.dir, lang: props.lang,
      'aria-pressed': state === 'selected' || undefined, onClick: props.onClick, disabled: props.disabled
    }, h('span', { className: 'sz-choice-text' }, props.children),
      CHOICE_WORD[state] && h('span', { className: 'sz-choice-word', dir: 'ltr', lang: 'en' }, CHOICE_WORD[state]));
  }

  var DIFF_LABEL = { wrong: 'wrong', missing: 'missing', extra: 'extra' };
  function DictationDiff(props) {
    return h('div', { className: 'sz-diff' },
      h('p', { className: 'sz-diff-line', lang: 'de' },
        (props.tokens || []).map(function (t, i) {
          var st = t.status || 'ok';
          if (st === 'ok') return h(F, { key: i }, h('span', { className: 'sz-tok sz-tok-ok' }, t.text), ' ');
          if (st === 'missing') return h(F, { key: i }, h('span', { className: 'sz-tok sz-tok-missing', title: 'missing' }, t.expected, h('span', { className: 'sz-sr' }, ' (missing)')), ' ');
          if (st === 'extra') return h(F, { key: i }, h('del', { className: 'sz-tok sz-tok-extra' }, t.text, h('span', { className: 'sz-sr' }, ' (extra)')), ' ');
          return h(F, { key: i }, h('span', { className: 'sz-tok sz-tok-wrong' }, h('del', null, t.text), h('ins', null, t.expected)), ' ');
        })),
      h('p', { className: 'sz-diff-legend' },
        h('span', { className: 'sz-leg sz-leg-wrong' }, 'wrong → right'),
        h('span', { className: 'sz-leg sz-leg-missing' }, 'missing'),
        h('span', { className: 'sz-leg sz-leg-extra' }, 'extra')),
      props.errorTag && h('p', { className: 'sz-diff-tag' }, 'Logged as ', h('strong', null, props.errorTag)));
  }

  function clarity(score) {
    if (score == null) return null;
    if (score >= 80) return { word: 'Clear', tone: 'good' };
    if (score >= 60) return { word: 'Mostly clear', tone: 'hard' };
    return { word: 'Not clear yet', tone: 'again' };
  }
  function SpeakFeedback(props) {
    var c = clarity(props.score);
    var flagged = (props.words || []).filter(function (w) { return w.flag; });
    return h('div', { className: 'sz-speak' },
      c && h('p', { className: cx('sz-speak-head', 'sz-tone-' + c.tone) }, c.word, h('span', { className: 'sz-speak-score' }, props.score + ' / 100')),
      h('p', { className: 'sz-sentence', lang: 'de' }, (props.words || []).map(function (w, i) {
        return h(F, { key: i }, h('span', { className: cx('sz-word', w.flag && 'sz-word-' + w.flag) }, w.text, w.flag && h('span', { className: 'sz-sr' }, ' (' + w.flag + ')')), ' ');
      })),
      flagged.length > 0 && h('p', { className: 'sz-speak-retry' }, 'Retry: ', flagged.map(function (w) { return w.text; }).join(', ')));
  }

  var SELF = [['again', 'Missed'], ['hard', 'Partly'], ['good', 'Got it']];
  function SelfGrade(props) {
    return h('div', { className: 'sz-self', role: 'group', 'aria-label': 'How did it go?' },
      SELF.map(function (g) {
        return h('button', {
          key: g[0], type: 'button', className: cx('sz-self-btn', 'sz-tone-' + g[0], props.value === g[0] && 'is-on'),
          'aria-pressed': props.value === g[0], onClick: props.onGrade ? function () { props.onGrade(g[0]); } : undefined
        }, g[1]);
      }));
  }

  var GRADE_WORD = { again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy' };
  function GradeChip(props) {
    var g = props.grade || 'good';
    var tone = g === 'easy' ? 'good' : g;
    return h('p', { className: 'sz-gradechip' },
      h('span', { className: cx('sz-chip', 'sz-chip-' + tone) }, GRADE_WORD[g]),
      h('span', { className: 'sz-gradechip-how' }, props.auto === false ? 'your grade' : 'graded automatically'),
      props.onOverride && h('button', { type: 'button', className: 'sz-link', onClick: props.onOverride }, 'Change'));
  }

  // ---- Progress --------------------------------------------------------
  var BANDS = [
    { n: 1, name: 'Survival', cefr: 'Pre-A1 → A1', from: 0, to: 300 },
    { n: 2, name: 'Foundations', cefr: 'A1', from: 300, to: 1000 },
    { n: 3, name: 'Everyday life', cefr: 'A2', from: 1000, to: 2000 },
    { n: 4, name: 'Threshold', cefr: 'A2+ → B1', from: 2000, to: 3000 }
  ];
  var CHECKPOINTS = [100, 300, 600, 1000, 1500, 2000, 2500, 3000];
  function BandRoadmap(props) {
    var n = props.sentences || 0, total = 3000;
    var next = CHECKPOINTS.filter(function (c) { return c > n; })[0];
    return h('section', { className: 'sz-road', 'aria-label': 'Roadmap' },
      h('p', { className: 'sz-road-head' }, h('strong', null, fmt(n)), ' of 3,000 sentences',
        next && h('span', { className: 'sz-road-next' }, ' · next checkpoint ' + fmt(next))),
      h('div', { className: 'sz-road-track' },
        BANDS.map(function (b) {
          var fill = Math.max(0, Math.min(1, (n - b.from) / (b.to - b.from)));
          return h('div', { key: b.n, className: 'sz-road-seg', style: { flexGrow: b.to - b.from } },
            h('span', { className: 'sz-road-fill sz-band-' + b.n, style: { width: (fill * 100) + '%' } }));
        }),
        CHECKPOINTS.map(function (c) {
          return h('span', { key: c, className: cx('sz-road-cp', c <= n && 'is-done'), style: { left: (c / total * 100) + '%' }, title: fmt(c) });
        })),
      h('ol', { className: 'sz-road-bands' }, BANDS.map(function (b) {
        return h('li', { key: b.n },
          h('span', { className: 'sz-road-bn' }, h('span', { className: 'sz-road-sw sz-band-' + b.n }), b.n + ' · ' + b.name),
          h('span', { className: 'sz-road-cefr' }, b.cefr + ' · ' + fmt(b.from + 1) + '–' + fmt(b.to)));
      })));
  }

  function SessionClose(props) {
    return h('section', { className: 'sz-close' },
      h('p', { className: 'sz-close-stat' }, props.recallPct + '%'),
      h('p', { className: 'sz-close-line' }, 'You now recall ' + props.recallPct + '% of ' + fmt(props.total) + ' sentences.'),
      h('dl', { className: 'sz-close-dl' },
        props.nextCheckpoint != null && h(F, null, h('dt', null, 'Next checkpoint'), h('dd', null, fmt(props.nextCheckpoint) + ' · ' + fmt(props.toNext) + ' to go')),
        props.tomorrowMin != null && h(F, null, h('dt', null, 'Tomorrow'), h('dd', null, 'about ' + props.tomorrowMin + ' min'))));
  }

  var DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  var DAY_STATE = { done: 'practised', frozen: 'covered by a freeze', missed: 'missed', today: 'today', future: '' };
  function StreakMeter(props) {
    var freezes = props.freezes != null ? props.freezes : 2;
    return h('section', { className: 'sz-streak' },
      h('p', { className: 'sz-streak-head' }, h('strong', null, props.days + ' days'),
        h('span', { className: 'sz-streak-fz' }, freezes + ' of 2 freezes left')),
      h('ol', { className: 'sz-streak-week' }, (props.week || []).map(function (s, i) {
        return h('li', { key: i, className: 'sz-day sz-day-' + s, title: DAY_STATE[s] },
          h('span', { className: 'sz-day-dot' }), h('span', { className: 'sz-day-l' }, DAY[i]),
          DAY_STATE[s] && h('span', { className: 'sz-sr' }, ' ' + DAY_STATE[s]));
      })));
  }

  function RecoveryNotice(props) {
    return h('section', { className: 'sz-recover' },
      h('p', { className: 'sz-recover-head' }, 'Welcome back.'),
      h('p', null, 'New sentences are paused while we catch up. The most-forgotten come first.'),
      h('p', { className: 'sz-recover-date' }, 'Back on track by ', h('strong', null, props.date)),
      props.children);
  }

  var EVIDENCE = { strong: 'Strong', moderate: 'Moderate', weak: 'Weak', company: 'Company', inference: 'Inference' };
  function EvidenceTag(props) {
    var l = props.level || 'strong';
    return h('span', { className: 'sz-ev sz-ev-' + l, title: props.title }, EVIDENCE[l]);
  }

  var api = {
    StartButton: StartButton, Button: Button, AudioButton: AudioButton, SlotText: SlotText,
    SentenceCard: SentenceCard, AlignmentStrip: AlignmentStrip, FamilyList: FamilyList, ChangePair: ChangePair, RuleCard: RuleCard,
    TaskHeader: TaskHeader, ChoiceOption: ChoiceOption, DictationDiff: DictationDiff, SpeakFeedback: SpeakFeedback,
    SelfGrade: SelfGrade, GradeChip: GradeChip,
    BandRoadmap: BandRoadmap, SessionClose: SessionClose, StreakMeter: StreakMeter, RecoveryNotice: RecoveryNotice,
    EvidenceTag: EvidenceTag,
    parseSlots: parseSlots, BANDS: BANDS, CHECKPOINTS: CHECKPOINTS
  };
  window.Satz = Object.assign(window.Satz || {}, api);
})();
