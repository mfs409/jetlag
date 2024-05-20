import { stage } from "../Stage";
import { AccelerometerMode } from "./Accelerometer";

/**
 * PlatformDevice provides an abstract way of describing things that depend on
 * the platform:
 * - Device Vibration
 * - App Termination
 * - Device-Specific Event Handlers
 * - Persistent Storage
 */
export interface PlatformDevice {
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
 * HtmlPlatformDevice provides the HTML5 versions of the key parts of a
 * PlatformDevice.  It is the default implementation.
 */
export class HtmlPlatformDevice implements PlatformDevice {
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
   * Construct an HtmlPlatformDevice
   *
   * @param accelerometerMode The desired mode for the accelerometer.  Defaults
   *                          to DISABLED
   */
  constructor(readonly accelerometerMode: AccelerometerMode = AccelerometerMode.DISABLED) { }
}