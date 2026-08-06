/**
 * VisibilityDevice provides the game with a way of knowing if it is visible or
 * not, by hooking into the HTML5 Page Visibility .
 */
export class VisibilityDevice {
  /** Code to run when the page loses visibility */
  public onLoseVisibility = async () => { };

  /** Code to run when the page gains visibility */
  public onGainVisibility = async () => { };

  /**
   * Whether we currently consider the page visible.  `visibilitychange` and
   * `blur`/`focus` can both fire for the same real event (e.g. opening a new
   * tab), so this is tracked and used to dedupe: a callback only runs when the
   * visibility state actually flips, not on every event.
   */
  private isVisible = !document.hidden;

  /**
   * Update `isVisible` and fire the matching callback, but only if this is
   * an actual change -- not a duplicate event for a transition we already
   * reported.
   *
   * @param visible The visibility state being reported
   */
  private setVisible(visible: boolean) {
    if (visible === this.isVisible) return;
    this.isVisible = visible;
    if (visible) this.onGainVisibility();
    else this.onLoseVisibility();
  }

  /**
   * The constructor installs listeners that can detect when a page
   * loses/gains visibility, and calls the appropriate callback.
   */
  constructor() {
    document.addEventListener("visibilitychange", () => this.setVisible(!document.hidden));
    window.addEventListener("blur", () => this.setVisible(false));
    window.addEventListener("focus", () => this.setVisible(true));
    window.addEventListener("beforeunload", () => this.setVisible(false));
  }
}
