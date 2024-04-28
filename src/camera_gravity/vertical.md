## A Vertical Perspective

For the last game in this chapter, we'll make the start of a doodle jump-like
game.  In the live demo below, you can use arrows to move left/right, and the
space bar to jump.

<iframe src="./game_04.iframe.html"></iframe>

This game requires the following assets:

- [green_ball.png](camera_gravity/green_ball.png)
- [mustard_ball.png](camera_gravity/mustard_ball.png)
- [night_0.png](camera_gravity/night_0.png)
- [night_1.png](camera_gravity/night_1.png)

After you've downloaded them to your `assets` folder, be sure to update this
line in your `Config` object:

```typescript
  imageNames = ["green_ball.png", "mustard_ball.png", "night_0.png", "night_1.png"];
```

We'll start by making a hero, setting up gravity, drawing a floor, and setting
up the camera bounds:

```typescript
    // Start with gravity and camera bounds
    stage.world.setGravity(0, 10);
    stage.world.camera.setBounds(0, undefined, 16, 9);

    // Every level will use tilt to control the hero, with arrow keys simulating
    // tilt on devices that lack an accelerometer
    stage.tilt.tiltMax.Set(10, 10);
    if (!stage.accelerometer.tiltSupported) {
      stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
      stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
      stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
      stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
    }

    // Make the floor
    new Actor({
      appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 9.05, width: 20, height: .1 }),
      role: new Obstacle(),
    });

    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { disableRotation: true }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
    stage.world.camera.setCameraFocus(h, 0, -2);
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));
```

This code is pretty similar to things we've seen before, but there are a few
interesting differences.

The first thing to notice is that the call to `camera.setBounds` has `undefined`
for its second argument.  If you hover your mouse over `setBounds`, you'll see
that the second argument is the *minimum* Y value.  Remember that down is
positive.  If we want a game that could keep going on forever, with the hero
moving up, our only option is to have negative Y values that keep getting more
and more negative.

The second thing that is a bit different is that the call to `setCameraFocus`
has two extra arguments.  By providing `x=0` and `y=-2`, we're indicating that
we want the camera to focus on a point that is 2 meters *above* the hero.  This
will make it easier to see more of the screen while playing.

Third, notice that we didn't use the `enableTilt` function that we wrote
earlier.  That's because we only want tilt for left/right.

Lastly, we set the space bar to make the hero `jump`.  There is a rather
complicated concept here: if we just added a negative Y velocity to the hero,
how could we know when the hero could jump again?  Our game kind of requires the
hero to only jump after landing on a platform.  Fortunately, in JetLag, we can
use the `Hero.jump` to give an upward velocity, and JetLag will not let the hero
jump again until after it collides with an obstacle.  That gets us the desired
condition for when the hero can jump again.

If you just tried moving left or right, soon the hero would go off screen and
never come back, because it would walk off of the floor we made.  To address the
problem, let's put some enemies off screen.  Since there's a way to lose, we
need to tell JetLag to restart this level if the hero collides with an enemy and
"loses" the level.

```typescript
    // Make the sides as enemies, but put them a tad off screen, because
    // that's a bit more kind
    new Actor({
      appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: -1, cy: -9, width: .1, height: 36 }),
      role: new Enemy(),
    });
    new Actor({
      appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
      rigidBody: new BoxBody({ cx: 17, cy: -9, width: .1, height: 36 }),
      role: new Enemy(),
    });
    stage.score.onLose = { level: level, builder: builder }
    // Note that there's an intentional bug in this code: these enemies don't go
    // as high as they should.  Can you tell why?
```

Next, let's provide a way to win, by putting a destination very high up in the
sky.  Remember that "high" means "negative y".

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: -26, radius: 0.5 }),
      role: new Destination(),
    });
    stage.score.setVictoryDestination(1);
    stage.score.onWin = { level: level, builder: builder }
```

We need a way for the hero to get up to that destination.  Let's make a function
that can make obstacles (platforms).  You can put this function *inside* the
`builder` function.

```typescript
    // create a platform that we can jump through from below
    function platform(cx: number, cy: number) {
      new Actor({
        appearance: new FilledBox({ z: -1, width: 2, height: 0.2, fillColor: "#FF0000" }),
        rigidBody: new BoxBody({ cx, cy, width: 2, height: 0.2, }, { collisionsEnabled: true, singleRigidSide: Sides.TOP }),
        // Set a callback, then re-enable the platform's collision effect.
        role: new Obstacle({ heroCollision: (_thisActor: Actor, collideActor: Actor) => (collideActor.movement as ManualMovement).updateYVelocity(-5) }),
      });
    }
```

In this function, we make an actor at the `cx, cy` coordinates that were
provided to it.  Notice how we don't need to say `{cx: cx, cy: cy}`.  TypeScript
has a nice shorthand when the value on the left side of a `:` has the same name
as is expected on the left side.

These obstacles have two new features.  The first is that they use
`singleRigidSide`, which means that an actor can only collide with the obstacle
by falling down onto it.  Actors, like the hero, can jump upward and pass
through the obstacle.  Second, we've provided an optional `heroCollision` code
for the Obstacle role.  This says that when a hero collides with the platform,
it should get a tiny upward jolt, to make it seem like it is bouncing.

Now we can use our function to make a bunch of platforms, each higher than the
last:

```typescript
    platform(3, 7.5);
    platform(5, 3.5);
    platform(3, -1.5);
    platform(6, -5.5);
    platform(10, -9.5);
    platform(3, -13.5);
    platform(4, -17.5);
    platform(5, -21.5);
    platform(6, -24.5);
```

(Now that it's possible to get very high, you should be able to figure out
what's wrong with our enemies.)

The last thing we'll do is make the background more interesting.  We saw before
that it's possible to use an image for the background.  We can also *animate*
images, by flipping between them rapidly.

```typescript
    // Set up an animated parallax background
    let animations = new Map();
    animations.set(AnimationState.IDLE_E, AnimationSequence.makeSimple({ timePerFrame: 550, repeat: true, images: ["night_0.png", "night_1.png"] }))
    stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new AnimatedSprite({ width: 16, height: 9, animations }), speed: 0.3, isHorizontal: false, isAuto: false });```
```

Animations are a complex topic, and there is a whole chapter devoted to them.
For now, all we really need to understand is that we made an AnimationSequence
that spends 550 milliseconds on each of its two images, and loops.  Then we used
a "map" to associate it with the "IDLE_E" state, which is the default state (it
means "facing to the east, not moving", but that's not really important right
now).

But we also didn't exactly make an *Actor* here.  Instead, we provided code for
making AnimatedSprites from that map, and we used it to tell the stage's
background system to tile the image vertically, so that the infinite level would
generate its infinite tiles of background on demand.  We also gave it a speed of
0.3, which means that it moves more slowly than the hero.  This is known as a
"Parallax" background, and it gives a nice sense of depth.

Here's the code for the whole game:

```typescript
import { initializeAndLaunch, stage } from "../jetlag/Stage";
import { AnimationSequence, AnimationState, JetLagGameConfig, Sides } from "../jetlag/Config";
import { AnimatedSprite, FilledBox, ImageSprite } from "../jetlag/Components/Appearance";
import { ManualMovement, TiltMovement } from "../jetlag/Components/Movement";
import { BoxBody, CircleBody } from "../jetlag/Components/RigidBody";
import { Destination, Enemy, Hero, Obstacle } from "../jetlag/Components/Role";
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
  imageNames = ["green_ball.png", "mustard_ball.png", "night_0.png", "night_1.png"];
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // Start with gravity and camera bounds
  stage.world.setGravity(0, 10);
  stage.world.camera.setBounds(0, undefined, 16, 9);

  // Every level will use tilt to control the hero, with arrow keys simulating
  // tilt on devices that lack an accelerometer
  stage.tilt.tiltMax.Set(10, 10);
  if (!stage.accelerometer.tiltSupported) {
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
  }

  // Make the floor
  new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 9.05, width: 20, height: .1 }),
    role: new Obstacle(),
  });

  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { disableRotation: true }),
    movement: new TiltMovement(),
    role: new Hero(),
  });
  stage.world.camera.setCameraFocus(h, 0, -2);
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));

  // Make the sides as enemies, but put them a tad off screen, because
  // that's a bit more kind
  new Actor({
    appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -1, cy: -9, width: .1, height: 36 }),
    role: new Enemy(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 17, cy: -9, width: .1, height: 36 }),
    role: new Enemy(),
  });
  stage.score.onLose = { level: level, builder: builder }
  // Note that there's an intentional bug in this code: these enemies don't go
  // as high as they should.  Can you tell why?

  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: -26, radius: 0.5 }),
    role: new Destination(),
  });
  stage.score.setVictoryDestination(1);
  stage.score.onWin = { level: level, builder: builder }

  // create a platform that we can jump through from below
  function platform(cx: number, cy: number) {
    new Actor({
      appearance: new FilledBox({ z: -1, width: 2, height: 0.2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx, cy, width: 2, height: 0.2, }, { collisionsEnabled: true, singleRigidSide: Sides.TOP }),
      // Set a callback, then re-enable the platform's collision effect.
      role: new Obstacle({ heroCollision: (_thisActor: Actor, collideActor: Actor) => (collideActor.movement as ManualMovement).updateYVelocity(-5) }),
    });
  }

  platform(3, 7.5);
  platform(5, 3.5);
  platform(3, -1.5);
  platform(6, -5.5);
  platform(10, -9.5);
  platform(3, -13.5);
  platform(4, -17.5);
  platform(5, -21.5);
  platform(6, -24.5);

  // Set up an animated parallax background
  let animations = new Map();
  animations.set(AnimationState.IDLE_E, AnimationSequence.makeSimple({ timePerFrame: 550, repeat: true, images: ["night_0.png", "night_1.png"] }))
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new AnimatedSprite({ width: 16, height: 9, animations }), speed: 0.3, isHorizontal: false, isAuto: false });
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
```
