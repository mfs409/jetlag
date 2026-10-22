import { ISound } from "../Services/AudioLibrary";

/** MusicComponent manages the background music for a stage */
export class MusicComponent {
  /** Track if the music is playing */
  private is_playing = false;

  /** If the level has music attached to it, this starts playing it */
  public play() {
    if (this.music && !this.music.playing() && !this.is_playing) {
      this.is_playing = true;
      this.music.play();
    }
  }

  /** If the level has music attached to it, this pauses it */
  public pause() {
    if (this.music && this.music.playing() && this.is_playing) {
      this.is_playing = false;
      this.music.pause();
    }
  }

  /** If the level has music attached to it, this stops it */
  public stop() {
    if (this.music && this.music.playing() && this.is_playing) {
      this.is_playing = false;
      this.music.stop();
    }
  }

  /** True if there is music that is playing */
  public get playing() {
    return (this.music) ? this.music.playing() && this.is_playing : false;
  }

  /**
   * Move the music's playback position
   *
   * @param seconds Where to seek to, in seconds
   */
  public seek(seconds: number) { this.music?.seek(seconds); }

  /**
   * Construct a MusicComponent by providing a music object to play.
   *
   * @param music The music object to use
   */
  constructor(private music?: ISound) { }
}

/**
 * MusicLayers is a set of named MusicComponents that can play at the same time,
 * such as a main theme, an ambient loop, and a playlist
 *
 * Putting a MusicComponent into a name that already holds one stops the old
 * one first, so a game never ends up with a track that it can no longer reach.
 */
export class MusicLayers {
  /** The layers, by name */
  private readonly layers = new Map<string, MusicComponent>();

  /**
   * Put a MusicComponent into a layer, stopping whatever was there before
   *
   * @param name  The name of the layer
   * @param music The MusicComponent that should now occupy the layer
   * @param start Should the new music start playing right away?  (default
   *              true)
   */
  public set(name: string, music: MusicComponent, start = true) {
    this.layers.get(name)?.stop();
    this.layers.set(name, music);
    if (start) music.play();
  }

  /**
   * Get the MusicComponent in a layer
   *
   * @param name The name of the layer
   *
   * @returns The MusicComponent, or undefined if the layer is empty
   */
  public get(name: string) { return this.layers.get(name); }

  /**
   * Stop the MusicComponent in a layer, and empty the layer
   *
   * @param name The name of the layer
   */
  public remove(name: string) {
    this.layers.get(name)?.stop();
    this.layers.delete(name);
  }

  /** Stop every layer's MusicComponent, and empty all of the layers */
  public clear() {
    this.layers.forEach(m => m.stop());
    this.layers.clear();
  }
}
