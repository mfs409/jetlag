## Our First Timer

In the following game, we'll use a timer to make some code run after five
seconds elapse:

<iframe src="./game_01.iframe.html"></iframe>

To achieve this behavior, we'll replace the contents of `builder()` with the
following code.  First we'll set up tilt, and a hero who can jump:

```typescript
    stage.world.setGravity(0, 10);
    enableTilt(10, 0);
    boundingBox();

    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));
```

Now we'll add a timer.  The `stage.world` and `stage.hud` each have a timer
object that counts milliseconds, so we give it a new `TimedEvent` that runs in 5
seconds.  `false` indicates that the timer does not repeat.  The code for making
a destination won't run until 5 seconds transpire.  At that time, a new
destination will be put on the screen:

```typescript
    stage.world.timer.addEvent(new TimedEvent(5, false, () => {
      // Make a destination
      new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
        rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
        role: new Destination(),
      });
    }))
```

Finally, we need to make sure that JetLag knows that reaching the destination
wins the level, and that JetLag knows what to do when the level is won or lost:

```typescript
    stage.score.setVictoryDestination(1);
    stage.score.onLose = { level, builder };
    stage.score.onWin = { level, builder };
```
