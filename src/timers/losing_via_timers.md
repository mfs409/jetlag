## Losing Via Timers

We can also use timers to lose a level.  This makes the most sense when there's
another way to win.  In essence, we're saying "if you don't finish in time, you
lose".

<iframe src="./game_03.iframe.html"></iframe>

To build this game, we'll start by setting up gravity and tilt:

```typescript
    stage.world.setGravity(0, 10);
    enableTilt(10, 0);
    boundingBox();
```

Now we can add a destination, and a hero who can jump and move via tilt:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
      role: new Destination(),
    });

    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));
```

We'll indicate what to do when the level is won or lost:

```typescript
    stage.score.setVictoryDestination(1);
    stage.score.onLose = { level, builder };
    stage.score.onWin = { level, builder };
```

And finally, we'll set a timer for losing the level.  We'll also display the
timer on the HUD.

```typescript
    stage.score.setLoseCountdownRemaining(5);
    new Actor({
      appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => (stage.score.getLoseCountdownRemaining()!.toFixed(2))),
      rigidBody: new CircleBody({ cx: 0.5, cy: 0.2, radius: 0.01 }, { scene: stage.hud })
    });
```

Before moving on with this tutorial, you should try to add a goodie that adds
time to the counter.  If you're not sure where to start, you might want to
review the previous section of this tutorial.
