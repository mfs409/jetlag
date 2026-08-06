/**
 * The buttons on a "standard mapping" gamepad (the W3C Gamepad API's
 * `mapping: "standard"` layout, which almost every modern controller Chrome
 * reports uses). Each value is that button's index into the browser
 * `Gamepad.buttons` array.
 */
export enum GamepadButton {
  A = 0, B = 1, X = 2, Y = 3,
  LEFT_SHOULDER = 4, RIGHT_SHOULDER = 5,
  LEFT_TRIGGER = 6, RIGHT_TRIGGER = 7,
  SELECT = 8, START = 9,
  LEFT_STICK = 10, RIGHT_STICK = 11,
  DPAD_UP = 12, DPAD_DOWN = 13, DPAD_LEFT = 14, DPAD_RIGHT = 15,
  HOME = 16,
}

/**
 * GamepadDevice represents a single controller slot (there are up to four,
 * matching the browser's `navigator.getGamepads()` indices -- see
 * `Stage.gamepads`). Unlike `KeyboardDevice`, there's no browser event for
 * "a gamepad button was pressed" -- the API is poll-only, so `poll()` is
 * called once per render tick (see `Stage.pollGamepads`), regardless of
 * whether the world, HUD, or an overlay is what's currently active. That
 * last part matters: it's what lets a pause overlay register its own
 * gamepad handlers (e.g. A to resume) the same way it can register keyboard
 * ones, instead of input going dead the moment a menu opens.
 */
export class GamepadDevice {
  /** Is a controller currently connected in this slot? */
  public connected = false;

  /** The left analog stick, each axis in [-1, 1] */
  public readonly leftStick = { x: 0, y: 0 };

  /** The right analog stick, each axis in [-1, 1] */
  public readonly rightStick = { x: 0, y: 0 };

  /** The left trigger's analog value, in [0, 1] (0 if the controller only reports it as a digital button) */
  public leftTrigger = 0;

  /** The right trigger's analog value, in [0, 1] (0 if the controller only reports it as a digital button) */
  public rightTrigger = 0;

  /** Handlers for when a button is pressed. These do not re-fire while the button is held. */
  private downHandlers: Map<GamepadButton, () => void> = new Map();

  /** Handlers for when a button is released */
  private upHandlers: Map<GamepadButton, () => void> = new Map();

  /** Which buttons were pressed as of the last poll, so we can detect down/up transitions */
  private wasPressed: Set<GamepadButton> = new Set();

  /**
   * Construct a GamepadDevice
   *
   * @param index The slot this device represents (0-3), matching
   *              `navigator.getGamepads()`'s indices
   */
  constructor(readonly index: number) { }

  /**
   * Set a handler to run when a button is pressed.  Named "Press", not
   * "Down", specifically because it's unlike `KeyboardDevice.setKeyDownHandler`:
   * this does not re-fire while the button is held -- it fires once, on the
   * down transition.
   *
   * @param button  The button to listen for
   * @param handler The code to run
   */
  public setButtonPressHandler(button: GamepadButton, handler: () => void) { this.downHandlers.set(button, handler); }

  /**
   * Set a handler to run when a button is released
   *
   * @param button  The button to listen for
   * @param handler The code to run
   */
  public setButtonUpHandler(button: GamepadButton, handler: () => void) { this.upHandlers.set(button, handler); }

  /**
   * Report whether `button` is currently held down, as of the last poll.
   * `setButtonPressHandler` deliberately only fires once, on the down
   * transition (see its docstring), so for a digital button that needs
   * hold/repeat semantics -- the gamepad equivalent of holding an arrow
   * key -- poll this every tick (e.g. from `Scene.repeatEvents`) instead,
   * the same way `leftStick`/`rightStick` are already meant to be polled
   * for analog hold-to-move input.
   *
   * @param button The button to check
   */
  public isPressed(button: GamepadButton) { return this.wasPressed.has(button); }

  /** Reset this device's handlers (e.g., between levels) */
  public clearHandlers() {
    this.downHandlers.clear();
    this.upHandlers.clear();
  }

  /**
   * Update this device's state from a browser `Gamepad` snapshot, and fire
   * any button handlers whose pressed state changed. Called once per render
   * tick by `Stage.pollGamepads`, for every slot, whether or not a
   * controller is actually connected there.
   *
   * @param raw The browser's `Gamepad` object for this slot, or `null`/`undefined` if nothing is connected
   */
  public poll(raw: Gamepad | null | undefined) {
    this.connected = !!raw && raw.mapping === "standard";
    if (!this.connected || !raw) {
      this.leftStick.x = this.leftStick.y = this.rightStick.x = this.rightStick.y = 0;
      this.leftTrigger = this.rightTrigger = 0;
      // A disconnect releases everything -- fire any pending up-handlers
      // now, instead of leaving stale "pressed" state that would only get
      // cleaned up by accident on some future reconnect.
      this.wasPressed.forEach(b => this.upHandlers.get(b)?.());
      this.wasPressed.clear();
      return;
    }

    this.leftStick.x = raw.axes[0] ?? 0;
    this.leftStick.y = raw.axes[1] ?? 0;
    this.rightStick.x = raw.axes[2] ?? 0;
    this.rightStick.y = raw.axes[3] ?? 0;
    this.leftTrigger = raw.buttons[GamepadButton.LEFT_TRIGGER]?.value ?? 0;
    this.rightTrigger = raw.buttons[GamepadButton.RIGHT_TRIGGER]?.value ?? 0;

    const nowPressed: Set<GamepadButton> = new Set();
    for (let b = 0; b <= GamepadButton.HOME; b++) {
      if (raw.buttons[b]?.pressed) nowPressed.add(b);
    }
    nowPressed.forEach(b => { if (!this.wasPressed.has(b)) this.downHandlers.get(b)?.(); });
    this.wasPressed.forEach(b => { if (!nowPressed.has(b)) this.upHandlers.get(b)?.(); });
    this.wasPressed = nowPressed;
  }
}
