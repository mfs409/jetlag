import { stage } from "../Stage";
import { AccelerometerMode } from "./Accelerometer";

/**
 * PlatformService provides an abstract way of describing things that depend on
 * the platform:
 * - Device Vibration
 * - App Termination
 * - Device-Specific Event Handlers
 * - Persistent Storage
 */
export interface PlatformService {
  /** Quit the game and close its window */
  quitter(): void;

  /**
   * Vibrate the device for some number of milliseconds
   *
   * @param ms  The number of milliseconds to vibrate
   */
  vibrate(ms: number): void

  /** The behavior of the device accelerometer */
  accelerometerMode: AccelerometerMode;
}

/**
 * HtmlPlatformService provides the HTML5 versions of the key parts of a
 * PlatformService.  It is the default implementation.
 */
export class HtmlPlatformService implements PlatformService {
  /** Quit the game and close its window */
  quitter() { window.close(); }

  /**
   * Vibrate the device for some number of milliseconds
   *
   * @param ms  The number of milliseconds to vibrate
   */
  vibrate(ms: number) {
    if (!!navigator.vibrate)
      navigator.vibrate(ms);
    else
      stage.console.log("Simulating " + ms + "ms of vibrate");
  }

  /**
   * Construct an HtmlPlatformService
   *
   * @param accelerometerMode The desired mode for the accelerometer.  Defaults
   *                          to DISABLED
   */
  constructor(readonly accelerometerMode: AccelerometerMode = AccelerometerMode.DISABLED) { }
}