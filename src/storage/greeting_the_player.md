## Greeting The Player

Our next bit of code will compare today's date with the date in `pstore`, to
decide if it needs to put a greeting on the screen.  We'll put the decision into
a variable called `new_day`:

```typescript
    let today = new Date();
    let new_day = false;
    let last_day = new Date(pstore.last_played);
    if (today.getDay() != last_day.getDay() || today.getMonth() != last_day.getMonth() || today.getFullYear() != last_day.getFullYear())
      new_day = true;
    pstore.last_played = today.toUTCString();
    pstore.num_times_played += 1;
    persist(pstore, "persistent_info");
```

While we were at it, we updated the `pstore` with today's date, and we added to
the number of times played.  Since we changed `pstore`, we had to call
`persist()`, of course.

The code above will interact with the code for initializing the `pstore` in a
way that might be surprising: when `first_time` is `true`, `last_day` and
`today` will be the same, so `new_day` will be `false`.  This is OK, because we
print a different message for `new_day` than for `first_time`.  Here's some code
that puts it all together by drawing an overlay on the screen with the
appropriate welcome message (if any).  Note that we could make use of `sstore`
if we also wanted a way to greet someone when they re-opened the page, but it
wasn't the first time today.

```typescript
    if (first_time) {
      stage.requestOverlay((overlay: Scene) => {
        new Actor({
          appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
          rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
          gestures: { tap: () => { stage.clearOverlay(); return true; } }
        });
        new Actor({
          appearance: new TextSprite({ center: true, face: "Arial", size: 32, color: "#FFFFFF" }, "Welcome!"),
          rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .01 }, { scene: overlay }),
        });
      }, false);
    }

    else if (new_day) {
      stage.requestOverlay((overlay: Scene) => {
        new Actor({
          appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
          rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
          gestures: { tap: () => { stage.clearOverlay(); return true; } }
        });
        new Actor({
          appearance: new TextSprite({ center: true, face: "Arial", size: 32, color: "#FFFFFF" }, "Welcome Back!"),
          rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .01 }, { scene: overlay }),
        });
      }, false);
    }
```

Now we can set up the gameplay.  We'll start with the border, the gravity, and a
hero:

```typescript
    stage.world.setGravity(0, 10);
    stage.tilt.tiltMax.Set(10, 0);
    if (!stage.accelerometer.tiltSupported) {
      stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
      stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
      stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
      stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
    }
    boundingBox();

    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));
```

Next, we'll intersperse enemies and goodies, and draw a destination:

```typescript
    for (let cx = 0.5; cx < 16.5; cx += 2) {
      let animations = new Map();
      animations.set(AnimationState.IDLE_E, AnimationSequence.makeSimple({ timePerFrame: 75, repeat: true, images: ["coin0.png", "coin1.png", "coin2.png", "coin3.png", "coin4.png", "coin5.png", "coin6.png", "coin7.png"] }))
      new Actor({
        appearance: new AnimatedSprite({ width: 0.4, height: 0.4, animations }),
        rigidBody: new CircleBody({ cx, cy: 5, radius: 0.2 }),
        role: new Goodie({ onCollect: () => { lstore.coins += 1; return true; } }),
      });
    }

    for (let cx = 1.5; cx < 16.5; cx += 2) {
      new Actor({
        appearance: new ImageSprite({ width: 0.4, height: 0.4, img: "red_ball.png" }),
        rigidBody: new CircleBody({ cx, cy: 5, radius: 0.2 }),
        role: new Enemy(),
      });
    }

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
      role: new Destination(),
    });
```

And then we'll put two counters on the HUD: one for coins, the other for rubies.
Notice how the coin count combines the values from `sstore` and `lstore`, so the
player knows how many coins they'll have *if they win*.

```typescript
    // Make the coin counter
    new Actor({
      appearance: new ImageSprite({ width: 0.4, height: 0.4, img: "coin0.png" }),
      rigidBody: new CircleBody({ cx: 0.5, cy: 0.5, radius: 0.2 }, { scene: stage.hud })
    });
    new Actor({
      appearance: new TextSprite({ face: "Arial", center: false, size: 24, color: "#000000" }, () => "x " + (lstore.coins + sstore.coins)),
      rigidBody: new CircleBody({ cx: 0.8, cy: 0.35, radius: 0.01 }, { scene: stage.hud })
    });

    // Make the ruby counter
    new Actor({
      appearance: new FilledPolygon({ fillColor: "#FF0000", vertices: [-.1, 0, 0, -.2, .1, 0, 0, .2] }),
      rigidBody: new CircleBody({ cx: 0.5, cy: 1, radius: 0.2 }, { scene: stage.hud })
    });
    new Actor({
      appearance: new TextSprite({ face: "Arial", center: false, size: 24, color: "#000000" }, () => "x " + (pstore.rubies)),
      rigidBody: new CircleBody({ cx: 0.8, cy: 0.9, radius: 0.01 }, { scene: stage.hud })
    });
```

We'll configure the win and lose behaviors, and set up an overlay that prints a
message when the player loses.  During the gameplay, we did not make any
modifications to `sstore` or `pstore` that would need to be rolled back, and we
know that when the level restarts, `lstore` will be reset, so we don't need any
special code, just a message.

```typescript
    // Specify default win and lose behaviors
    stage.score.setVictoryDestination(1);
    stage.score.onLose = { level, builder };
    stage.score.onWin = { level, builder };

    // When the player loses, just give a message and let them start over
    stage.score.loseSceneBuilder = (overlay) => {
      new Actor({
        appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
        gestures: { tap: () => { stage.clearOverlay(); stage.switchTo(builder, level); return true; } }
      });
      new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 32, color: "#FFFFFF" }, "Try Again"),
        rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .01 }, { scene: overlay }),
      });
    }
```

In contrast, when the level is won, we're going to have to do some real work.
Note that we could have done this in the destination's arrival function,
instead, but since I wanted the overlay to tell the player how many rubies they
minted and how many coins they minted, this was a little bit easier.

In the `winSceneBuilder`, we'll start by moving coins from the `lstore` to the
`sstore`.  This signifies that any coins that were collected have become
"permanent".

The next thing we do is convert coins to rubies.  It may seem odd that I'm using
a `while` loop here, instead of doing some smarter math.  I really only did that
because I wanted to show a `while` loop.  A `while` loop will run over and over,
as long as the condition in parentheses is true.  In this case, each time the
loop runs, `sstore.coins` will get smaller, until eventually there are not
enough coins to make another ruby, and the loop will end.  @@red Note that this
kind of code would be inefficient if `sstore.coins` could be large.  It's OK
here, because sstore won't ever get above 12.@@

If we minted any rubies, we'll update `pstore` and call `persist()`.  After
that, all that remains is to set up a border, so that tapping will clear the
overlay and start the level, and to put some text on the screen.

```typescript
    // When the player wins, move coins from local to session storage, and then
    // compute ruby updates before printing a message
    stage.score.winSceneBuilder = (overlay) => {
      sstore.coins += lstore.coins;
      let rubies = 0;
      while (sstore.coins > 5) {
        rubies += 1;
        sstore.coins -= 5;
      }
      if (rubies > 0) {
        pstore.rubies += rubies;
        persist(pstore, "persistent_info");
      }
      new Actor({
        appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
        gestures: { tap: () => { stage.clearOverlay(); stage.switchTo(builder, level); return true; } }
      });
      new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 32, color: "#FFFFFF" }, "Good Job"),
        rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .01 }, { scene: overlay }),
      });
      if (rubies == 1) {
        new Actor({
          appearance: new TextSprite({ center: true, face: "Arial", size: 32, color: "#FFFFFF" }, "You earned 1 ruby"),
          rigidBody: new CircleBody({ cx: 8, cy: 5.5, radius: .01 }, { scene: overlay }),
        });
      }
      if (rubies == 2) {
        new Actor({
          appearance: new TextSprite({ center: true, face: "Arial", size: 32, color: "#FFFFFF" }, "You earned 2 rubies"),
          rigidBody: new CircleBody({ cx: 8, cy: 5.5, radius: .01 }, { scene: overlay }),
        });
      }
    }
```
