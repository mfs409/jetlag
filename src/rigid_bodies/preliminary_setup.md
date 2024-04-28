## Preliminary Setup

In this tutorial, we're going to primarily work in the `builder` function.
Let's set up the rest of `game.ts` first, so that we don't have distractions
later.

The first step is to clean out your `game.ts` file.  Erase everything, and
replace it with this:

```typescript
import { initializeAndLaunch } from "../jetlag/Stage";
import { JetLagGameConfig } from "../jetlag/Config";
import { AccelerometerMode } from "../jetlag/Services/Accelerometer";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  pixelMeterRatio = 100;
  screenDimensions = { width: 1600, height: 900 };
  adaptToScreenSize = true;
  canVibrate = true;
  accelerometerMode = AccelerometerMode.DISABLED;
  storageKey = "--no-key--";
  hitBoxes = true;
  resourcePrefix = "./assets/";
  musicNames = [];
  soundNames = [];
  imageNames = [];
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
```

Next, let's set up the assets that we'll use throughout these tutorials.
Download these files to your `assets` folder:

- [green_ball.png](rigidbody/green_ball.png)
- [purple_ball.png](rigidbody/purple_ball.png)
- [blue_ball.png](rigidbody/blue_ball.png)
- [red_ball.png](rigidbody/red_ball.png)
- [grey_ball.png](rigidbody/grey_ball.png)
- [mustard_ball.png](rigidbody/mustard_ball.png)
- [mid.png](rigidbody/mid.png)

Then update your 'Config' object:

```typescript
  imageNames = ["green_ball.png", "purple_ball.png", "blue_ball.png", "red_ball.png", "grey_ball.png", "mustard_ball.png", "mid.png"];
```

Most of the mini-games in this tutorial are going to use tilt, and most of them
will also need to surround the 16x9 world with obstacles that keep the actors
from going off screen.  We can put two functions at the bottom of `game.ts` so
that we don't have to write that code over and over again:

```typescript
/** Draw a bounding box that surrounds the default world viewport */
function boundingBox() {
  // Draw a box around the world
  let t = new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: -.05, width: 16, height: .1 }),
    role: new Obstacle(),
  });
  let b = new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 9.05, width: 16, height: .1 }),
    role: new Obstacle(),
  });
  let l = new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  let r = new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  // Return the four sides as an object with fields "t", "b", "l", and "r" 
  // (for top/bottom/left/right)
  return { t, b, l, r };
}

/**
 * Enable Tilt, and set up arrow keys to simulate it
 *
 * @param xMax  The maximum X force
 * @param yMax  The maximum Y force
 */
function enableTilt(xMax: number, yMax: number) {
  stage.tilt.tiltMax.Set(xMax, yMax);
  if (!stage.accelerometer.tiltSupported) {
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
  }
}
```

Now it's time to get started!
