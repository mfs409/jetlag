## An Overhead Game Where The World Is Bigger Than The Camera

In our very first game, back in the first chapter, it was possible for the hero
to go off the screen.  The game is reproduced below, just in case you want to
convince yourself that it's a problem:

<iframe src="../getting_started/game_01.iframe.html"></iframe>

In this part of the chapter, we'll start thinking about how to handle this
problem.  To begin with, let's be a bit more exact about what we are seeing.  In
the game, there is a hero and there is a camera.  The camera is centered on the
point (8, 4.5), which is the center of a world that starts at (0,0), is 16
meters wide, and is 9 meters high.  The camera has no reason to follow the hero
as the hero goes off screen, and the camera has no way of preventing the hero
from going off screen.  Indeed, it wouldn't even make sense for the camera to be
able to limit the hero's movement... we probably need to use some rigidBodies in
the `stage.world` for that purpose.

To explore this problem in more depth, here's the game we are going to make.  It
is not at all interesting or fun.  It consists of a large world (64x36 meters)
that the hero can navigate.  There is a yellow ball somewhere on the screen that
the hero needs to reach in order to win.

<iframe src="./game_02.iframe.html"></iframe>

There is surprising complexity to this game:

- The world has boundaries
- The camera has boundaries
- The camera keeps the hero in view at all times
- We use a png file to put a background on the screen
- Clicking the right half of the screen causes the camera to zoom in
- Clicking the left half of the screen causes the camera to zoom out

Let's get started.  The first thing you should do is clear out your `game.ts`
file, so it looks like it did at the beginning of the "Camera+Gravity" game.

We're going to start by setting up our graphics.  You will need to download
these three files and put them in your `assets` folder:

- [noise.png](camera_gravity/noise.png)
- [green_ball.png](camera_gravity/green_ball.png)
- [mustard_ball.png](camera_gravity/mustard_ball.png)

Next, update your `Config` with this line:

```typescript
  imageNames = ["green_ball.png", "mustard_ball.png", "noise.png"];
```

When you run your game, be sure to press `F12` and check the console.  If JetLag
can't find any of these files, it will immediately stop and print an error.

Next, let's add the hero.  Once you save your code, the game should
automatically refresh in your browser, and you should see the green ball.  Since
we haven't configured tilt, the hero isn't going to be able to move yet.

```typescript
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
```

Now is a good time to stop and look at what happens when you mis-type an image
name.  Go ahead and change the text, maybe by capitalizing the "g" in
"green_ball".  You should see an error in the console.  Next, try changing "png"
to "pong".  That will result in a different error message.  

```admonish note
You may see "Deprecation Warnings" or warnings about the "AudioContext".  These
can be ignored
```

Next, let's make it so that our hero can move.  We're going to control the hero
with tilt, and we're going to simulate tilt using the keyboard.  As you work through this book, you'll discover that we are going to use this
same code many times.  That means it's a good candidate for a function.  So
let's make a function, and put it at the bottom of the file:

```typescript
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

This code won't do anything until we call it, so in your `builder()` function,
be sure to add this line:

```typescript
enableTilt(10, 10);
```

Since the hero uses `TiltMovement`, pressing the arrows will automatically cause
tilt to move the hero.  But, of course, this reveals our next problem: the hero
can still go off the screen.  We can fix this problem by requesting that the
camera always follow the hero:

```typescript
    // By default, the camera is centered on the point 8, 4.5f.  We can instead
    // have the camera stay centered on the hero, so that we can keep seeing the
    // hero as it moves around the world.
    stage.world.camera.setCameraFocus(h);
```

What just happened?  Now it seems like the hero isn't moving!  The problem is
that the camera is staying centered on the hero at all times.  With no
background, it's hard to see that the hero is moving.  We can convince ourselves
that it is moving, though, by opening up the developer console and clicking the
screen as we use the arrow keys.  You should see that the world coordinates are
changing as the hero moves.

Since we want a world that is 64x36 meters, a natural thing to do is to draw
some background images.  We'll use `noise.png` for that purpose:

```typescript
    // As the hero moves around, it's going to be hard to see that it's really
    // moving.  Draw some "noise" in the background.  Note that we're changing
    // the Z index.
    //
    // This code uses "for loops".  The outer loop will run 4 times (0, 16, 32,
    // 48).  Each time, the inner loop will run 4 times (0, 9, 18, 27), drawing
    // a total of 16 images.
    for (let x = 0; x < 64; x += 16) {
      for (let y = 0; y < 36; y += 9) {
        // This is kind of neat: a picture is just an actor without a role or rigidBody
        new Actor({
          appearance: new ImageSprite({ width: 16, height: 9, img: "noise.png", z: -1 }),
          rigidBody: new BoxBody({ cx: x + 8, cy: y + 4.5, width: 16, height: 9 }, { collisionsEnabled: false }),
        });
      }
    }
```

In the notes for this code, you can see that there are two loops.  Loops let us
do the same thing repeatedly.  In this case, we are using `for` loops, which
means that each has a "loop control variable" (`x` and `y`, respectively), which
changes on each iteration of the loop.  So in the end, this is going to make 16
copies of the "noise.png" image, and line them up in a big 64x36 space.  Note
that we are using `collisionsEnabled: false` and `z:-1` so that our hero won't
bounce off of these actors, and these actors will be behind the hero.

Since we only drew pictures, and didn't make obstacles, it is possible for our
hero to go outside of the boundaries of our nice image.  The next thing we'll do
is draw four thin obstacles that bound the space where we drew those pictures:

```typescript
    // Draw four walls, covering the four borders of the world
    new Actor({
      appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 32, cy: -.05, width: 64, height: .1 }),
      role: new Obstacle(),
    });
    new Actor({
      appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 32, cy: 36.05, width: 64, height: .1 }),
      role: new Obstacle(),
    });
    new Actor({
      appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: -.05, cy: 18, width: .1, height: 36 }),
      role: new Obstacle(),
    });
    new Actor({
      appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 64.05, cy: 18, width: .1, height: 36 }),
      role: new Obstacle(),
    });
```

You might be getting tired of hearing me say "now we have another problem".  But
notice that each time we added some code, we got *closer* to our goal.  And each
new problem was probably a bit simpler than the one before it.  Our new problem
is that the camera is keeping the hero centered, even when the hero is at the
extreme edges of what we want the world to be.  We can fix this by putting
boundaries on the camera.  As you add the following line, be sure to hover over
the `setBounds` method name so you can see its documentation:

```typescript
    // Set up some boundaries on the camera, so we don't show beyond the borders
    // of our background:
    stage.world.camera.setBounds(0, 0, 64, 36);
```

Our "game" isn't going to have any enemies.  Instead, we'll say that you win by
finding the destination.  To do that, we'll put a destination into the world,
indicate that the game is won when one hero reaches that destination, and then
tell JetLag to re-start the level when it is won:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 55, cy: 28, radius: 0.4 }),
      role: new Destination(),
    });

    // Set up win conditions and win behavior
    stage.score.setVictoryDestination(1);
    stage.score.onWin = { level: level, builder: builder }
```

The last thing we'll do in this game is add buttons for zooming in and out.  We
have a small issue when doing this, though.  Where should we put the buttons?
If we put them *in the world*, then they might not be on-screen, depending on
where the camera is focused.

To overcome this issue, JetLag actually runs two physics simulations at all
time.  `stage.world` is the one we've been working with so far.  `stage.hud`
(the heads up display) is a slightly less powerful physics simulation and camera
system.  This HUD is always exactly the size of the camera viewport, so anything
we put on the HUD will always be on screen.

The nicest part is that the HUD is pretty much just like the world... we put
actors on it in the exact same way, but add `{scene: stage.hud}` to tell the
rigidBody not to put itself in `stage.world`.

```typescript
    // add zoom buttons. We are using blank images, which means that the buttons
    // will be invisible... that's nice, because we can make the buttons big
    // (covering the left and right halves of the screen).  When debug rendering
    // is turned on, we'll be able to see an outline of the two rectangles. You
    // could also use images, but if you did, you'd probably want to use some
    // transparency so that they don't cover up the gameplay.

    // Note: these go on the HUD
    new Actor({
      appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 4, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
      gestures: {
        tap: () => {
          if (stage.world.camera.getScale() > 50) stage.world.camera.setScale(stage.world.camera.getScale() - 10);
          return true;
        }
      }
    });
    new Actor({
      appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 12, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
      gestures: {
        tap: () => {
          if (stage.world.camera.getScale() < 200) stage.world.camera.setScale(stage.world.camera.getScale() + 20);
          return true;
        }
      }
    });
```

In the above code, there is one more new feature: a `gestures` component.  This
lets us receive touch and mouse events on an actor, and run code in response to
them.  In this case, we change the effective pixel-to-meter ratio (via the
camera's `scale`) when either button is pressed.  This gives the effect of
zooming in or out.

To be honest, our zoom implementation isn't that great: the numbers 50, 10, 20,
and 200 make sense if you're running on an HD screen, but they don't necessarily
make sense for phones or games that aren't running in full-screen mode.  We
won't worry about that for now... once you gain more skill with game
development, you'll be able to figure out how to work around these kinds of
problems.

Here's the final code for this game:

```typescript
import { initializeAndLaunch, stage } from "../jetlag/Stage";
import { JetLagGameConfig } from "../jetlag/Config";
import { FilledBox, ImageSprite } from "../jetlag/Components/Appearance";
import { TiltMovement } from "../jetlag/Components/Movement";
import { BoxBody, CircleBody } from "../jetlag/Components/RigidBody";
import { Destination, Hero, Obstacle } from "../jetlag/Components/Role";
import { Actor } from "../jetlag/Entities/Actor";
import { KeyCodes } from "../jetlag/Services/Keyboard";
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
  imageNames = ["green_ball.png", "mustard_ball.png", "noise.png"];
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  enableTilt(10, 10);

  // By default, the camera is centered on the point 8, 4.5f.  We can instead
  // have the camera stay centered on the hero, so that we can keep seeing the
  // hero as it moves around the world.
  stage.world.camera.setCameraFocus(h);

  // As the hero moves around, it's going to be hard to see that it's really
  // moving.  Draw some "noise" in the background.  Note that we're changing
  // the Z index.
  //
  // This code uses "for loops".  The outer loop will run 4 times (0, 16, 32,
  // 48).  Each time, the inner loop will run 4 times (0, 9, 18, 27), drawing
  // a total of 16 images.
  for (let x = 0; x < 64; x += 16) {
    for (let y = 0; y < 36; y += 9) {
      // This is kind of neat: a picture is just an actor without a role or rigidBody
      new Actor({
        appearance: new ImageSprite({ width: 16, height: 9, img: "noise.png", z: -1 }),
        rigidBody: new BoxBody({ cx: x + 8, cy: y + 4.5, width: 16, height: 9 }, { collisionsEnabled: false }),
      });
    }
  }

  // Draw four walls, covering the four borders of the world
  new Actor({
    appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 32, cy: -.05, width: 64, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 32, cy: 36.05, width: 64, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.05, cy: 18, width: .1, height: 36 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 64.05, cy: 18, width: .1, height: 36 }),
    role: new Obstacle(),
  });

  // Set up some boundaries on the camera, so we don't show beyond the borders
  // of our background:
  stage.world.camera.setBounds(0, 0, 64, 36);

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 55, cy: 28, radius: 0.4 }),
    role: new Destination(),
  });

  // Set up win conditions and win behavior
  stage.score.setVictoryDestination(1);
  stage.score.onWin = { level: level, builder: builder }

  // add zoom buttons. We are using blank images, which means that the buttons
  // will be invisible... that's nice, because we can make the buttons big
  // (covering the left and right halves of the screen).  When debug rendering
  // is turned on, we'll be able to see an outline of the two rectangles. You
  // could also use images, but if you did, you'd probably want to use some
  // transparency so that they don't cover up the gameplay.

  // Note: these go on the HUD
  new Actor({
    appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 4, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
    gestures: {
      tap: () => {
        if (stage.world.camera.getScale() > 50) stage.world.camera.setScale(stage.world.camera.getScale() - 10);
        return true;
      }
    }
  });
  new Actor({
    appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 12, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
    gestures: {
      tap: () => {
        if (stage.world.camera.getScale() < 200) stage.world.camera.setScale(stage.world.camera.getScale() + 20);
        return true;
      }
    }
  });
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);

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
