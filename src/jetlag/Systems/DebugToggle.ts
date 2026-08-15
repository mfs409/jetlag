import { KeyCodes } from "../Devices/Keyboard";
import { stage } from "../Stage";

/**
 * DebugToggle is a lightweight system for letting the player press a key to
 * show/hide hitbox/debug-outline rendering at run time.
 *
 * In reality, this isn't useful enough to be an official part of JetLag, but it
 * is convenient for the tutorials, so we're keeping it.
 */
export class DebugToggle {
  /**
   * Track if it's already been enabled/disabled since the last refresh, to
   * avoid resetting on every `switchTo` call.
   */
  private static hasForcedOff = false;

  /**
   * Wire up a key to toggle the rendering of hitboxes on the fly.  This only
   * works if `hitBoxes` is `true` in the game's `Config` object.
   *
   * @param cfg.key The key that toggles debug rendering (default: `b`)
   */
  public static enable(cfg: { key?: KeyCodes } = {}) {
    // With `hitBoxes: false`, no actor ever gets a debug outline to show in
    // the first place (see `RigidBody`'s constructors), so there's nothing
    // for to toggle
    if (!stage.config.hitBoxes) return;
    if (!DebugToggle.hasForcedOff) {
      if (stage.renderer.debugVisible) stage.renderer.setDebugVisible(false);
      DebugToggle.hasForcedOff = true;
    }
    stage.keyboard.setKeyUpHandler(cfg.key ?? KeyCodes.KEY_B, () => stage.renderer.setDebugVisible(!stage.renderer.debugVisible));
  }
}
