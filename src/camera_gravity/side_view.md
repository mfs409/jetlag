## A "Side-View" Game

Next, let's build a game where gravity is downward, and the camera is to the
"side" of the actors.  This is the perspective you might seen in a platformer
game, like Super Mario Bros, or in an endless runner game like Jetpack Joyride.

<iframe src="./game_03.iframe.html"></iframe>

Before we start writing code, let's briefly discuss what is happening in this
game:

- There is a destination that the hero needs to reach in order to win
- There is a time limit
- Gravity is downward, the world has boundaries, and the camera follows the hero
- Arrow keys control the hero
- The space bar makes the hero jump

Note that in this game, there are no graphics assets.  That means we can start
by re-setting the code to the point it was at when we started the first part of
this chapter.

The first thing we'll do is put a grid on the screen:

```typescript
    // Draw a grid on the screen, covering the whole visible area
    GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 32, y: 9 });
```

Next, let's set up the boundaries on the world.  Other than changing a few
numbers, this is the same code as in our last game.

```typescript
    // Based on the values in the Config object, we can expect to have a
    // screen that is a 16:9 ratio.  It will seem that the viewable area is 16
    // meters by 9 meters.  We'll make the "world" twice as wide.  All this
    // really means is that the camera won't show anything outside of the range
    // (0,0):(32,9):
    stage.world.camera.setBounds(0, 0, 32, 9);

    // Draw four walls, covering the four borders of the world
    new Actor({
      appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 16, cy: .05, width: 32, height: .1 }),
      role: new Obstacle(),
    });
    new Actor({
      appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 16, cy: 8.95, width: 32, height: .1 }),
      role: new Obstacle(),
    });
    new Actor({
      appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: .05, cy: 4.5, width: .1, height: 9 }),
      role: new Obstacle(),
    });
    new Actor({
      appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 31.95, cy: 4.5, width: .1, height: 9 }),
      role: new Obstacle(),
    });
```

Next, let's add a hero.  We'll say that when you click or tap the hero, it will
"jump".  JetLag has a better way of doing jumping, but for now, we'll just do it
this way, because this code is hopefully pretty familiar.

```typescript
    // Make a hero
    let h = new Actor({
      appearance: new FilledCircle({ radius: .75, fillColor: "#0000ff", lineWidth: 3, lineColor: "#000044" }),
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .75 }),
      role: new Hero(),
      movement: new ManualMovement(),
      gestures: { tap: () => { (h.movement as ManualMovement).updateYVelocity(-8); return true; } },
    });
```

Tapping the hero does make it go up, but it never comes back down.  That's
because we need to put some gravity into the world.  Note that you could change
the gravity on the fly (for example, in response to a gesture).  That could make
for an interesting change to the gameplay.  For now, we'll just call
`setGravity` once, in builder, while setting up the game:

```typescript
    // This game will be a platformer/side scroller, so we want gravity
    // downward:
    stage.world.setGravity(0, 9.8);
```

Now let's configure the arrow keys, so the hero can move left/right:

```typescript
    // Set up arrow keys to control the hero
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (h.movement as ManualMovement).updateXVelocity(-5); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (h.movement as ManualMovement).updateXVelocity(0); });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (h.movement as ManualMovement).updateXVelocity(5); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (h.movement as ManualMovement).updateXVelocity(0); });
```

Of course, we'll want the camera to follow the hero:

```typescript
    // Let the camera follow the hero
    stage.world.camera.setCameraFocus(h);
```

Next, we'll add a way to "win" the game.  This will involve a destination.
Notice that the destination doesn't have a `movement`, so its rigidBody will
just hover in place.

```typescript
    // Make a destination
    new Actor({
      appearance: new FilledCircle({ radius: .5, fillColor: "#00ff00", lineWidth: 3, lineColor: "#004400" }),
      rigidBody: new CircleBody({ cx: 31, cy: 6, radius: .5 }),
      role: new Destination(),
    });

    // Set up "winning"
    stage.score.onWin = { level: level, builder: builder }
    stage.score.setVictoryDestination(1);
```

If we want there to be a time limit, all we need to do is put a number into the
"lose countdown" timer:

```typescript
    // Set a timer for losing
    stage.score.setLoseCountdownRemaining(10);
    stage.score.onLose = { level: level, builder: builder }
```

While that counter worked, it would be annoying to play a game where the player
couldn't see how much time was left.  In JetLag, we can use text as the
appearance for an actor.  Unfortunately, just writing some text is probably not
going to look too good, so let's make two actors.  We'll put them both on the
HUD.  The first will just be a gray box.  The second will be the text.

```typescript
    // Draw a box, and write the timer on top of it.  Both go on the HUD
    new Actor({
      appearance: new FilledBox({ width: .75, height: .75, fillColor: "#eeeeee", lineWidth: 3, lineColor: "#000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: .75, width: .75, height: .75 }, { scene: stage.hud }),
    });
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: "#444444", size: 48 }, 
                                 () => (stage.score.getLoseCountdownRemaining() ?? 0).toFixed(0)),
      rigidBody: new BoxBody({ cx: 8, cy: .75, width: 1.8, height: 1 }, { scene: stage.hud }),
    });
```

For the most part, this code looks like everything else we've been writing...
but then there's this part: `() => (stage.score.getLoseCountdownRemaining() ??
0).toFixed(0)`.  One reason this is complex is because of the rules of the
programming language we are using.  Briefly, until we said
`setLoseCountdownRemaining(10)`, calls to `getLoseCountdownRemaining()` would
not return a number... they'd return `undefined`.  So
`(stage.score.getLoseCountdownRemaining() ?? 0)` can be read as "the number of
seconds remaining, if it's not undefined, and 0 otherwise.  Then, we use
`toFixed(0)` to chop the decimal point off of the number.

But what about the `()=>` part?  First of all, that's shorthand.  We could have
said `() => { return (stage.score.getLoseCountdownRemaining() ?? 0).toFixed(0);
}`.  But in TypeScript, if you are making a function using the `()=>{}` syntax,
and the body (in `{}`) only has a single return statement, then you can skip the
`{}` and skip the word `return`.

But that didn't address the real question.  Why do we need a function here?  Why
can't we just say `(stage.score.getLoseCountdownRemaining() ?? 0).toFixed(0)`?
The answer is that every time we call `getLoseCountdownRemaining()`, we get its
current value.  But when we make the `TextSprite`, the game hasn't started yet!
If we read that value, it would be 10, and the counter would always report "10".

By wrapping the code like this (we sometimes say "making the code into a
callback" or "wrapping it in a lambda"), we're really saying that we want JetLag
to re-compute the text that is being displayed.  JetLag runs at 45 frames per
second, so we should expect the text to be re-computed that often.  If we did
`.toFixed(1)`, we'd see one decimal point.  If we did `.toFixed(2)`, we'd see
two decimal points, but the number wouldn't increment in units of .01, so we'd
actually be able to reverse engineer the frames per second.

As you're testing out this code, it might be a good idea to set `hitBoxes` to
false, so you can get a better sense for what the game would really look like.

To recap, here's all of the code we just wrote:

```typescript
import { initializeAndLaunch, stage } from "../jetlag/Stage";
import { JetLagGameConfig } from "../jetlag/Config";
import { FilledBox, FilledCircle, TextSprite } from "../jetlag/Components/Appearance";
import { ManualMovement } from "../jetlag/Components/Movement";
import { BoxBody, CircleBody } from "../jetlag/Components/RigidBody";
import { Destination, Hero, Obstacle } from "../jetlag/Components/Role";
import { Actor } from "../jetlag/Entities/Actor";
import { GridSystem } from "../jetlag/Systems/Grid";
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
  imageNames = [];
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // Draw a grid on the screen, covering the whole visible area
  GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 32, y: 9 });

  // Based on the values in the Config object, we can expect to have a
  // screen that is a 16:9 ratio.  It will seem that the viewable area is 16
  // meters by 9 meters.  We'll make the "world" twice as wide.  All this
  // really means is that the camera won't show anything outside of the range
  // (0,0):(32,9):
  stage.world.camera.setBounds(0, 0, 32, 9);

  // Draw four walls, covering the four borders of the world
  new Actor({
    appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: .05, width: 32, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: 8.95, width: 32, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: .05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 31.95, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });

  // Make a hero
  let h = new Actor({
    appearance: new FilledCircle({ radius: .75, fillColor: "#0000ff", lineWidth: 3, lineColor: "#000044" }),
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .75 }),
    role: new Hero(),
    movement: new ManualMovement(),
    gestures: { tap: () => { (h.movement as ManualMovement).updateYVelocity(-8); return true; } },
  });

  // This game will be a platformer/side scroller, so we want gravity
  // downward:
  stage.world.setGravity(0, 9.8);

  // Set up arrow keys to control the hero
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (h.movement as ManualMovement).updateXVelocity(-5); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (h.movement as ManualMovement).updateXVelocity(0); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (h.movement as ManualMovement).updateXVelocity(5); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (h.movement as ManualMovement).updateXVelocity(0); });

  // Let the camera follow the hero
  stage.world.camera.setCameraFocus(h);

  // Make a destination
  new Actor({
    appearance: new FilledCircle({ radius: .5, fillColor: "#00ff00", lineWidth: 3, lineColor: "#004400" }),
    rigidBody: new CircleBody({ cx: 31, cy: 6, radius: .5 }),
    role: new Destination(),
  });

  // Set up "winning"
  stage.score.onWin = { level: level, builder: builder }
  stage.score.setVictoryDestination(1);

  // Set a timer for losing
  stage.score.setLoseCountdownRemaining(10);
  stage.score.onLose = { level: level, builder: builder }

  // Draw a box, and write the timer on top of it.  Both go on the HUD
  new Actor({
    appearance: new FilledBox({ width: .75, height: .75, fillColor: "#eeeeee", lineWidth: 3, lineColor: "#000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: .75, width: .75, height: .75 }, { scene: stage.hud }),
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", color: "#444444", size: 48 },
      () => (stage.score.getLoseCountdownRemaining() ?? 0).toFixed(0)),
    rigidBody: new BoxBody({ cx: 8, cy: .75, width: 1.8, height: 1 }, { scene: stage.hud }),
  });
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
```
