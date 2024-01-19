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

  /** Report if there is music that is playing */
  public playing() {
    return (this.music) ? this.music.playing() && this.is_playing : false;
  }

  /**
   * Construct a MusicComponent by providing a music object to play.
   *
   * @param music The music object to use
   */
  constructor(private music?: ISound) { }
}
