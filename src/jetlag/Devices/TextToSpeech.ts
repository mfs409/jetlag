/**
 * TextToSpeechDevice provides speech synthesis (text-to-speech) via the
 * browser's SpeechSynthesis API.  It does not queue or track individual
 * utterances itself; the browser's own utterance queue handles that.
 */
export class TextToSpeechDevice {
  /** True if this browser supports speech synthesis at all */
  readonly supported = typeof window !== "undefined" && "speechSynthesis" in window;

  /**
   * True while an utterance is currently being spoken (not counting paused
   * speech)
   */
  get speaking() { return this.supported && speechSynthesis.speaking; }

  /** True while speech is paused */
  get paused() { return this.supported && speechSynthesis.pending; }

  /**
   * Speak some text out loud.  Utterances are queued by the browser, so
   * calling this while something is already speaking will not interrupt it;
   * call `stop()` first if you want to interrupt.
   *
   * @param cfg.text    The text to speak
   * @param cfg.rate    Speaking rate, in [0.1, 10].  Defaults to 1 (normal speed)
   * @param cfg.pitch   Voice pitch, in [0, 2].  Defaults to 1 (normal pitch)
   * @param cfg.volume  Volume, in [0, 1].  Defaults to 1 (full volume)
   * @param cfg.lang    A BCP 47 language tag (e.g. "en-US"), if you want to
   *                    override the voice's default language
   * @param cfg.voice   A specific voice to use, from `getVoices()`
   * @param cfg.onDone  Code to run once this utterance finishes speaking
   * @param cfg.onError Code to run if this utterance fails to speak
   */
  speak(cfg: { text: string, rate?: number, pitch?: number, volume?: number, lang?: string, voice?: SpeechSynthesisVoice, onDone?: () => void, onError?: (err: SpeechSynthesisErrorEvent) => void }) {
    if (!this.supported) return;
    let utterance = new SpeechSynthesisUtterance(cfg.text);
    if (cfg.rate !== undefined) utterance.rate = cfg.rate;
    if (cfg.pitch !== undefined) utterance.pitch = cfg.pitch;
    if (cfg.volume !== undefined) utterance.volume = cfg.volume;
    if (cfg.lang !== undefined) utterance.lang = cfg.lang;
    if (cfg.voice !== undefined) utterance.voice = cfg.voice;
    if (cfg.onDone) utterance.onend = () => cfg.onDone!();
    if (cfg.onError) utterance.onerror = (err) => cfg.onError!(err);
    speechSynthesis.speak(utterance);
  }

  /** Immediately stop the current utterance and clear the queue of any others */
  stop() { if (this.supported) speechSynthesis.cancel(); }

  /** Pause the current utterance, if any */
  pause() { if (this.supported) speechSynthesis.pause(); }

  /** Resume a paused utterance, if any */
  resume() { if (this.supported) speechSynthesis.resume(); }

  /**
   * Get the list of voices available for speech synthesis.  On some browsers,
   * this list is empty until the browser fires its `voiceschanged` event, so
   * code that needs voices immediately on page load may need to also listen for
   * that event directly.
   */
  getVoices() { return this.supported ? speechSynthesis.getVoices() : []; }
}
