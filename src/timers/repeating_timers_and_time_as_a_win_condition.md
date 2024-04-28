## Repeating Timers And Time As A Win Condition

In this next mini-game, we'll set up a timer that makes enemies reproduce.
We'll also say that if the player stays alive for 5 seconds, they win.

<iframe src="./game_02.iframe.html"></iframe>

We'll begin by setting up a world with an overhead view:

```typescript
    stage.world.setGravity(0, 0);
    enableTilt(10, 10);
    boundingBox();
```

Now let's define how the level is won.  By using `setVictorySurvive()`, we can
indicate that after 10 seconds, the level is won.  We'll also put some text on
the *HUD* to show how much time is left.  Notice that `toFixed(2)` will trim our
timer down to 2 decimal places.  (The `!` after `getWinCountdownRemaining()` is
our way of telling TypeScript "don't worry, this will really be a number"... you
can ignore it).

```typescript
    // Specify default win and lose behaviors
    stage.score.onLose = { level, builder };
    stage.score.onWin = { level, builder };

    // Next, let's say that if you survive for 10 seconds, you win:
    stage.score.setVictorySurvive(10);

    new Actor({
      appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => (stage.score.getWinCountdownRemaining()!.toFixed(2))),
      rigidBody: new CircleBody({ cx: 0.5, cy: 0.2, radius: 0.01 }, { scene: stage.hud })
    });
```

Next, we'll make a hero and a goodie.  If the hero collects the goodie, we will
subtract two seconds from the timer, making it easier to win.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 1, radius: 0.25 }),
      role: new Goodie({ onCollect: () => { stage.score.setWinCountdownRemaining(stage.score.getWinCountdownRemaining()! - 2); return true; } }),
    });
```

Finally, we'll make a timer that runs every 2 seconds.  The tricky thing about
this timer is that we want it to "reproduce" every enemy on the screen.  That
means we need to keep track of all of the enemies.

We can use an "array" to store the enemies we've made so far.  So our first step
will be to make an enemy, make an array, and put the enemy into the array. We'll
attach some "extra" information to the enemy, so that we can track how many
times we've duplicated an enemy... if we don't, we'll risk making thousands of
enemies (if we double every 2 seconds, after 20 seconds we've made 1024
enemies!).

```typescript
    let e = new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 14, cy: 7, radius: 0.25 }),
      movement: new TiltMovement(),
      role: new Enemy(),
      extra: { num: 6 } // We'll use this to count down so we don't make too many enemies
    });

    // We can use this array to store all of the enemies in the level
    let enemies: Actor[] = [];
    enemies.push(e);
```

Now comes the hard part.  The problem is that we're supposed to go through the
array, and for each thing in the array, we need to make another enemy.  But we
need to put those new enemies into the array too.  If we're not careful, we'll
end up putting new things into the array and immediately duplicating them, which
will put new things into the array, which we'll immediately duplicate... that
sounds like it's never going to stop!

Instead, we'll put all the new enemies into a new array, and after we're done
with all the duplications, we'll add the new array into the `enemies` array.

```typescript
    // set a timer that runs every 2 seconds
    //
    // Note: the timer repeats over and over, but at some point, our code will
    // just not do anything in response to it, because all the enemies will have 
    // exhausted their number of reproductions
    stage.world.timer.addEvent(new TimedEvent(2, true, () => {
      // newEnemies is where we'll track the enemies we make during this round 
      // of the timer
      let newEnemies: Actor[] = [];

      // For each enemy we've made, if it has remaining reproductions, then make
      // another enemy
      for (let e of enemies) {
        // If this enemy has remaining reproductions
        if (e.extra.num > 0) {
          // decrease remaining reproductions
          e.extra.num -= 1;

          // reproduce the enemy, putting the new one "real close" to the 
          // existing one.
          let e2 = new Actor({
            appearance: new ImageSprite({ width: .5, height: .5, img: "red_ball.png" }),
            rigidBody: new CircleBody({ cx: e.rigidBody.getCenter().x + 0.01, cy: e.rigidBody.getCenter().y + 0.01, radius: .25 }),
            movement: new TiltMovement(),
            role: new Enemy(),
            extra: { num: e.extra.num }
          });
          newEnemies.push(e2);
        }
      }

      // We finished reproducing the enemies, so now we can add the new enemies
      // to the main list
      let tmp = enemies.concat(newEnemies);
      enemies = tmp;
    }));
```

This mini-game shows an important point: the timer itself is not difficult.  The
hard thing is making sure that our timer does what we want it to do.
