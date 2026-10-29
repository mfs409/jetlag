import { Howl, Howler } from "howler";
import { JetLagGameConfig, assetBaseUrl } from "../Config";

/**
 * An abstract representation of a sound
 *
 * We use ISound so that the rest of JetLag doesn't need to know about Howler,
 * but an ISound is really just a Howl object.
 *
 * NB:  Sound effects don't currently pause when a pause screen is showing.
 */
export interface ISound {
  /**
   * Play the sound, as a new, independent instance (the same sound can be
   * played more than once concurrently)
   *
   * @returns An id for this specific instance of the sound, for use with the
   *          other methods below, so they can control this instance without
   *          affecting any other concurrently-playing instance of the same
   *          sound
   */
  play(): number;

  /**
   * Stop playing the sound, resetting its playback position to the start
   *
   * @param id  The id (from `play()`) of the specific instance to stop.  Omit
   *            to stop all instances.
   */
  stop(id?: number): void;

  /**
   * Pause the sound, so we can resume it later via `play()`
   *
   * @param id  The id (from `play()`) of the specific instance to pause.  Omit
   *            to pause all instances.
   */
  pause(id?: number): void;

  /**
   * Report if the sound is currently playing
   *
   * @param id  The id (from `play()`) of the specific instance to check.  Omit
   *            to report if any instance of the sound is playing.
   */
  playing(id?: number): boolean;

  /**
   * Get the current playback position (in seconds)
   *
   * @param id  The id (from `play()`) of the specific instance to query.  Omit
   *            to query the most recent instance.
   */
  seek(id?: number): number;

  /**
   * Move the playback position to `seek` (in seconds)
   *
   * @param seek  The new playback position, in seconds
   * @param id    The id (from `play()`) of the specific instance to move.  Omit
   *              to move the most recent instance.
   */
  seek(seek: number, id?: number): this;

  /**
   * Get the playback rate (speed) of the sound.  1 is normal, 2 is twice as
   * fast (and an octave higher), and 0.5 is half as fast (and an octave lower).
   *
   * @param id  The id (from `play()`) of the specific instance to query.  Omit
   *            to query the most recent instance.
   */
  rate(id?: number): number;
  /**
   * Change the playback rate (speed) of the sound.  Since a faster sound is
   * also higher, this is how to play one recording at different pitches.
   *
   * @param rate  The new rate: 1 is normal, 2 is twice as fast, and 0.5 is half
   *              as fast
   * @param id    The id (from `play()`) of the specific instance to change.
   *              Omit to change all instances.
   */
  rate(rate: number, id?: number): this;

  /**
   * Get the volume of the sound
   *
   * @param id  The id (from `play()`) of the specific instance to query.  Omit
   *            to query the most recent instance.
   */
  volume(id?: number): number;
  /**
   * Change the volume of the sound
   *
   * @param volume  The new volume, from 0 (silent) to 1 (full)
   * @param id      The id (from `play()`) of the specific instance to change.
   *                Omit to change all instances.
   */
  volume(volume: number, id?: number): this;
}

/**
 * AudioLibraryService provides a library of sound and music objects that can be
 * played at any time.  The only difference between sounds and music is that
 * music objects will always loop, whereas sound objects never will.
 */
export class AudioLibraryService {
  /** All of the sounds (non-looping audio) in the game, by name */
  private readonly sounds = new Map<string, ISound>();

  /** All of the music (looping audio) in the game, by name */
  private readonly music = new Map<string, ISound>();

  /**
   * Create the service by loading all of the game's audio files
   *
   * NB: The creation of Howls is async.  It's possible that they will take a
   * long time to load, in which case playback is queued until they are loaded.
   *
   * @param config The game-wide configuration
   */
  constructor(config: JetLagGameConfig) {
    if (!config.resources) {
      return;
    }
    const base = assetBaseUrl(config);
    for (let name of config.resources.soundNames ?? []) {
      this.sounds.set(name, new Howl({ src: [base + name] }));
    }
    for (let name of config.resources.musicNames ?? []) {
      this.music.set(name, new Howl({ src: [base + name], loop: true }));
    }
  }

  /**
   * Get a previously loaded Sound object.  It's an error to ask for a sound
   * that isn't in the list of sound names in the game's `Config`.
   *
   * @param soundName Name of the sound file to retrieve
   */
  getSound(soundName: string): ISound {
    const ret = this.sounds.get(soundName);
    if (!ret)
      throw new Error(`There is no sound named '${soundName}'`);
    return ret;
  }

  /**
   * Get a previously loaded Music object.  It's an error to ask for music that
   * isn't in the list of music names in the game's `Config`.
   *
   * @param musicName Name of the music file to retrieve
   */
  getMusic(musicName: string): ISound {
    const ret = this.music.get(musicName);
    if (!ret)
      throw new Error(`There is no music named '${musicName}'`);
    return ret;
  }

  /**
   * The volume of everything, from 0 (silent) to 1 (full).  This multiplies
   * with `musicVolume` and `sfxVolume`.
   */
  public get masterVolume() { return Howler.volume(); }
  /** The volume of everything, from 0 (silent) to 1 (full) */
  public set masterVolume(volume: number) { Howler.volume(volume); }

  /**
   * The volume of all music, from 0 (silent) to 1 (full).  The default is 1.
   *
   * NB: Setting the volume of one playback of a sound, via `ISound.volume(v,
   * id)`, overrides this for that playback.
   */
  public get musicVolume() { return this._musicVolume; }
  /** The volume of all music, from 0 (silent) to 1 (full) */
  public set musicVolume(volume: number) {
    this._musicVolume = volume;
    this.music.forEach(m => m.volume(volume));
  }
  /** The volume of all music, from 0 (silent) to 1 (full) */
  private _musicVolume = 1;

  /**
   * The volume of all sound effects, from 0 (silent) to 1 (full).  The default
   * is 1.
   *
   * NB: Setting the volume of one playback of a sound, via `ISound.volume(v,
   * id)`, overrides this for that playback.
   */
  public get sfxVolume() { return this._sfxVolume; }
  /** The volume of all sound effects, from 0 (silent) to 1 (full) */
  public set sfxVolume(volume: number) {
    this._sfxVolume = volume;
    this.sounds.forEach(s => s.volume(volume));
  }
  /** The volume of all sound effects, from 0 (silent) to 1 (full) */
  private _sfxVolume = 1;

  /**
   * Is all audio muted?  Muting doesn't change any of the volume settings, so
   * unmuting puts everything back the way it was.
   */
  public get muted() { return this._muted; }
  /** Is all audio muted? */
  public set muted(muted: boolean) {
    this._muted = muted;
    Howler.mute(muted);
  }
  /** Is all audio muted? */
  private _muted = false;
}
