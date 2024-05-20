// Be sure to execute the following commands before using this file:
// - `npm i @capacitor/core`
// - `npm i -D @capacitor/cli`
// - `npm i @capacitor/status-bar`
// - `npm i @capacitor/app`
// - `npm i @capacitor/haptics`
// - `npm i @capacitor/preferences`
//
// You will also want to check the (TODO) capacitor chapter

import { StatusBar } from '@capacitor/status-bar';
import { AccelerometerMode } from "./Services/Accelerometer";
import { PlatformService } from "./Services/Platform";
import { App } from '@capacitor/app';
import { Haptics } from '@capacitor/haptics';

/**
 * CapacitorPlatformService provides the Capacitor.js version of the key parts
 * of a PlatformService.  It is intended for mobile devices.
 */
export class CapacitorPlatformService implements PlatformService {
  /** Quit the game and close its window */
  quitter() { App.exitApp(); }

  /**
   * Vibrate the device for some number of milliseconds
   *
   * Capacitor has robust Haptics support.  See
   * <https://capacitorjs.com/docs/apis/haptics> for details.  You'll probably
   * want to change this function to use some of those features.
   *
   * @param _ms The number of milliseconds to vibrate.  Unused in Capacitor.
   */
  vibrate(_ms: number) { Haptics.vibrate(); }

  /**
   * Construct a CapacitorPlatformService
   *
   * @param accelerometerMode The desired mode for the accelerometer
   */
  private constructor(readonly accelerometerMode: AccelerometerMode) { }

  /**
   * Configure the device and then return a CapacitorPlatformService that the
   * rest of JetLag can use
   *
   * @param hideStatusBar     Should the device's status bar be hidden?
   *                          Defaults to true.
   * @param accelerometerMode The desired mode for the accelerometer.  Defaults
   *                          to DISABLED
   */
  static async init(hideStatusBar: boolean = true, accelerometerMode: AccelerometerMode = AccelerometerMode.DISABLED) {
    // Device configuration: hide the status bar, set the back button to exit
    // the app.
    if (hideStatusBar)
      await StatusBar.hide();
    App.addListener("backButton", () => App.exitApp())

    // TODO: turn off music when game loses focus
    document.addEventListener("visibilitychange", (event) => {
      console.log(event);
      console.log(document.visibilityState);
    });

    // TODO: install a wake lock

    // TODO: install a loading screen

    // Now we can create the platform service
    return new CapacitorPlatformService(accelerometerMode)
  }
}
