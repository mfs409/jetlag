import { b2Vec2 } from "@box2d/core";
import { stage } from "../Stage";

/**
 * Accelerometer behavior can vary among devices (phones, tablets).  This enum
 * is a crude attempt to provide a hook for JetLag to recalibrate its
 * Accelerometer directions depending on the device.
 *
 * TODO: This is only tested on Android phones, not tablets.  iOS is not tested.
 * This should be thought of as code to anticipate a problem, not to solve a
 * real problem.
 */
export enum AccelerometerMode {
  ANDROID_LANDSCAPE, ANDROID_PORTRAIT, IOS_LANDSCAPE, IOS_PORTRAIT, DISABLED
}

/**
 * AccelerometerDevice provides access to device orientation and motion events
 * from a web browser. The support for orientation and motion varies among
 * browsers, but it seems that the "acceleration including gravity" component of
 * DeviceMotion events gives us roughly the data we need.
 *
 * DeviceMotion events happen whenever they want to happen, but JavaScript won't
 * let them happen in the middle of a render.  When the events happen, we copy
 * the event data, and then during render operations, other code can poll this
 * device for the most recent data.
 */
export class AccelerometerDevice {
  /** The most recent accelerometer reading */
  readonly accel = new b2Vec2(0, 0);

  /** Is this device listening for accelerometer events? */
  private listening = false;

  /**
   * Has a real reading arrived yet?  A browser can have the motion API but no
   * sensor behind it (most computers are like that), so only an actual reading
   * proves that tilt will work.
   */
  private gotReading = false;

  /**
   * Is tilt supported on this device?  This is false on a device with no
   * accelerometer, and also during the first moments of a game on a phone,
   * before the first reading arrives.
   */
  public get tiltSupported(): boolean { return this.listening && this.gotReading; }

  /**
   * Create the device
   *
   * @param mode  portrait vs. landscape information, so we can interpret x/y/z
   *              correctly
   */
  constructor(mode: AccelerometerMode) {
    // If there's a request to disable, don't use the accelerometer
    if (mode == AccelerometerMode.DISABLED) {
      return;
    }

    // If the device doesn't exist, disable the accelerometer
    if (!("DeviceMotionEvent" in window)) {
      stage.console.log("DeviceMotion API not available... unable to use tilt to control entities");
      return;
    }

    if (mode == AccelerometerMode.IOS_LANDSCAPE || mode == AccelerometerMode.IOS_PORTRAIT) {
      stage.console.log("Unsupported device orientation mode");
      return;
    }

    // Install a listener.  It just reads the latest value and makes it
    // available to others.
    this.listening = true;
    window.addEventListener("devicemotion",
      (ev: DeviceMotionEvent) => {
        if (ev.accelerationIncludingGravity && ev.accelerationIncludingGravity.x !== null) {
          this.gotReading = true;
          if (mode == AccelerometerMode.ANDROID_PORTRAIT) {
            this.accel.x = -ev.accelerationIncludingGravity.x!;
            this.accel.y = ev.accelerationIncludingGravity.y!;
          }
          else if (mode == AccelerometerMode.ANDROID_LANDSCAPE) {
            this.accel.x = ev.accelerationIncludingGravity.y!;
            this.accel.y = ev.accelerationIncludingGravity.x!;
          }
        }
      },
      false
    );
  }
}
