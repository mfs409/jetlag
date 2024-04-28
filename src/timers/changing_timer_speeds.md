## Changing Timer Speeds

Some game frameworks have a way of saying that a timer should wait a few
seconds, then start running at some interval.  Others have a way of changing a
timer's frequency on the fly.  JetLag does not support either of these.  If you
need a timer to wait before it starts repeating, you can just create it fro
*within another timer*.

It would be easy enough to change the `TimedEvent` so that its interval could be
updated on the fly.  For now, if you need this behavior, your best bet is to run
your timed event at a very high rate, and compute the real frequency inside of
the timer code.

<iframe src="./game_05.iframe.html"></iframe>

Part of the trick for making this work is that we know that JetLag ony runs at
45 frames per second, so we can use a very fast timer, and not worry about it
ever going "too fast".  In the example below, the timer runs every half second.
Let's call this a "tick".  We count the ticks via the `counter` variable.  We
also use the number of defeated enemies as the "phase".  When none have been
defeated, the phase is 10, so it takes 10 ticks before the counter does any
work.  As the number of defeated enemies goes up, the phase goes down, until it
reaches 1, at which point a new enemy will be produced every tick (i.e., every
half second).

```typescript
    stage.score.setVictoryEnemyCount(20);
    stage.world.setGravity(0, 3);

    let counter = 0;
    stage.world.timer.addEvent(new TimedEvent(.5, true, () => {
      let phase = Math.max(1, 10 - stage.score.getEnemiesDefeated()!);
      counter = (counter + 1) % phase;
      if (counter != 0) return;
      let e = new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
        rigidBody: new CircleBody({ cx: .5 + 15 * Math.random(), cy: -5.5 + 5 * Math.random(), radius: .5 }),
        role: new Enemy(),
        movement: new GravityMovement(),
        gestures: { tap: () => { (e.role as Enemy).defeat(true); return true; } }
      })
    }));

    new Actor({
      appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => stage.score.getEnemiesDefeated() + ""),
      rigidBody: new CircleBody({ cx: 0.5, cy: 0.2, radius: 0.01 }, { scene: stage.hud })
    });

    stage.score.onLose = { level, builder };
    stage.score.onWin = { level, builder };
```
