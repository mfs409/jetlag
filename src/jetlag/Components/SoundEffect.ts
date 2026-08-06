import { stage } from "../Stage";
import { ISound } from "../Services/AudioLibrary";

/** The events an actor can have a sound effect attached to */
export type SoundEffectName = "disappear" | "toss" | "arrive" | "defeat" | "jump" | "collide" | "punch";

/**
 * SoundEffect provides a set of sounds associated with events that can happen
 * to an actor.  This lets us easily know which sound to play without having to
 * rely on a callback.  Note that this component has the full set of possible
 * sounds, even though not all are appropriate for any single actor.
 */
export class SoundEffectComponent {
  /**
   * The configured sounds, by event name.
   *
   * NB: Partial/Record is essentially an interface that only has optional
   * fields, no methods.
   */
  private sounds: Partial<Record<SoundEffectName, ISound>> = {};

  /**
   * Construct a SoundEffectComponent from the file names of the sounds to play
   * on events.
   *
   * @param config           An object with the names of the sounds for events
   *                         for which a sound should play
   * @param config.disappear The sound to play when the actor disappears
   * @param config.toss      The sound to play when the actor tosses a
   *                         projectile
   * @param config.arrive    The sound to play upon arrival at a destination
   * @param config.defeat    The sound to play when the actor is defeated
   * @param config.jump      The sound to play when the actor jumps
   * @param config.collide   The sound to play when there is a collision with
   *                         this actor
   * @param config.punch     The sound to play when the actor punches
   */
  constructor(config: Partial<Record<SoundEffectName, string>>) {
    if (config.disappear) this.sounds.disappear = stage.musicLibrary.getSound(config.disappear);
    if (config.toss) this.sounds.toss = stage.musicLibrary.getSound(config.toss);
    if (config.arrive) this.sounds.arrive = stage.musicLibrary.getSound(config.arrive);
    if (config.defeat) this.sounds.defeat = stage.musicLibrary.getSound(config.defeat);
    if (config.jump) this.sounds.jump = stage.musicLibrary.getSound(config.jump);
    if (config.collide) this.sounds.collide = stage.musicLibrary.getSound(config.collide);
    if (config.punch) this.sounds.punch = stage.musicLibrary.getSound(config.punch);
  }

  /**
   * Play the sound effect for `which` event, if one was configured for it
   *
   * @param which The event whose sound should play
   */
  public play(which: SoundEffectName) { this.sounds[which]?.play(); }

  /**
   * Play the sound effect for `which` event, but only if it isn't already
   * playing -- useful for events (like repeated collisions) that can recur
   * faster than the sound finishes
   *
   * @param which The event whose sound should play
   */
  public playIfNotPlaying(which: SoundEffectName) {
    if (!this.playing(which)) this.play(which);
  }

  /**
   * Pause the sound effect for `which` event, if one was configured and is
   * currently playing
   *
   * @param which The event whose sound should pause
   */
  public pause(which: SoundEffectName) { this.sounds[which]?.pause(); }

  /**
   * Stop the sound effect for `which` event, if one was configured
   *
   * @param which The event whose sound should stop
   */
  public stop(which: SoundEffectName) { this.sounds[which]?.stop(); }

  /**
   * Report whether the sound effect for `which` event is currently playing
   *
   * @param which The event to check
   */
  public playing(which: SoundEffectName) {
    return this.sounds[which]?.playing() ?? false;
  }
}
