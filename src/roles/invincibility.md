## Invincibility

For our last mini-game of this tutorial, we'll see how JetLag supports
invincibility.  In this level, the goodie (blue ball) adds 15 seconds of
invincibility to the hero.  But be careful... not all enemies can be defeated
by invincibility.  That's an important point... if you were making a game
like Super Mario Bros, you might want to put an enemy in the bottom of each
pit, to detect when the hero fell off stage.  If the hero was invincible,
you'd still want to start over on such a collision!

<iframe src="game_17.iframe.html"></iframe>

In this level, we'll say that you need to defeat three enemies to win:

```typescript
    stage.score.setVictoryEnemyCount(3);
```

Now we'll make a basic hero:

```typescript
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }, { density: 2 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
```

Next, we'll add five enemies.  We'll make them all rotate.  The last enemy won't
damage an invincible hero, but also won't be defeated when an invincible hero
collides with it.  The middle enemy will automatically defeat the hero, even
when the hero is invincible.  Also, notice that we use `disableHeroCollision`,
so that the hero passes through enemies, instead of bouncing off of them.

```typescript
    for (let i = 0; i < 5; ++i) {
      let cfg = { cx: i + 4, cy: 6, radius: 0.25, width: 0.5, height: 0.5, img: "red_ball.png" };
      new Actor({
        appearance: new ImageSprite(cfg),
        rigidBody: new CircleBody(cfg, { density: 1.0, elasticity: 0.3, friction: 0.6, rotationSpeed: 1 }),
        role: new Enemy({ immuneToInvincibility: i == 4, instantDefeat: i == 2, disableHeroCollision: true }),
      });
    }
```

Next, we'll add a goodie that makes the hero invincible.  Notice that we don't
just set the `invincibleRemaining`, instead we *add* to it.  We could have just
set it to 15, but this approach would let there be several goodies, and the hero
could accrue lots of time being invincible.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.25, }, { rotationSpeed: .25 }),
      role: new Goodie({
        onCollect: (_g: Actor, h: Actor) => {
          (h.role as Hero).invincibleRemaining = ((h.role as Hero).invincibleRemaining + 15); return true;
        }
      }),
    });
```

Finally, we'll put some text on the screen to show how much invincibility time
is remaining.  We haven't really discussed text yet, so this code might be
confusing.  Don't worry... we'll get to it in a later tutorial.  The main thing
to remember is that you need to give the player some cues about invincibility,
so they can use it well.

```typescript
    new Actor({
      appearance: new TextSprite({ face: "Arial", size: 16, color: "#3C64BF", center: false }, () => (hero.role as Hero).invincibleRemaining.toFixed(0) + " Invincibility"),
      rigidBody: new CircleBody({ radius: .01, cx: .01, cy: 1 }, { scene: stage.hud })
    })
```
