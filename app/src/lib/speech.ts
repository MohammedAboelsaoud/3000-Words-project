// Browser speech: text-to-speech for German audio and speech recognition for speaking tasks.
// Both are free. Recognition in Chrome sends audio to Google to transcribe; the app says so.

export function germanVoices(): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return [];
  const all = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('de'));
  // Prefer de-DE voices, keep the rest as extra variety.
  return all.sort((a, b) => Number(b.lang === 'de-DE') - Number(a.lang === 'de-DE'));
}

/** Resolves once the browser has loaded its voice list (it loads asynchronously in Chrome). */
export function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  if (typeof speechSynthesis === 'undefined') return Promise.resolve([]);
  const now = germanVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(germanVoices()), 1500);
    speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(t); resolve(germanVoices()); }, { once: true });
  });
}

/** A short display name: "Microsoft Katja Online (Natural) - German (Germany)" → "Katja". */
export function voiceName(v: SpeechSynthesisVoice | undefined): string | undefined {
  if (!v) return undefined;
  const m = v.name.match(/(?:Microsoft|Google|Apple)?\s*([A-ZÄÖÜ][a-zäöüß]+)/);
  return m?.[1] && !/^(Deutsch|German)$/.test(m[1]) ? m[1] : v.name.split(' ')[0];
}

function say(text: string, voice: SpeechSynthesisVoice | undefined, rate: number): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang ?? 'de-DE';
    if (voice) u.voice = voice;
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

/** Natural speed; the slow version is always followed by natural speed. */
export async function playSentence(text: string, voice: SpeechSynthesisVoice | undefined, slow = false): Promise<void> {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  if (slow) await say(text, voice, 0.65);
  await say(text, voice, 0.95);
}

export function stopAudio() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}

type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function RecognitionCtor(): (new () => Recognition) | null {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function recognitionAvailable(): boolean {
  // The hosted artifact frame refuses the microphone, so speaking tasks are skipped there.
  if (import.meta.env.VITE_ARTIFACT) return false;
  return typeof window !== 'undefined' && RecognitionCtor() !== null;
}

/** Listen once in German; resolves with the transcript ('' if nothing was heard). */
export function listen(): { result: Promise<string>; stop: () => void } {
  const Ctor = RecognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error('Speech recognition is not available in this browser.')), stop: () => {} };
  const r = new Ctor();
  r.lang = 'de-DE';
  r.interimResults = false;
  r.maxAlternatives = 1;
  r.continuous = false;
  const result = new Promise<string>((resolve, reject) => {
    let text = '';
    r.onresult = (e) => { text = Array.from(e.results).map((res) => res[0].transcript).join(' '); };
    r.onerror = (e) => (e.error === 'no-speech' ? resolve('') : reject(new Error(e.error)));
    r.onend = () => resolve(text);
  });
  r.start();
  return { result, stop: () => r.stop() };
}
