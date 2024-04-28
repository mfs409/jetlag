## Obstacle-Enemy Collisions

In the next mini-game, we'll see two new features of Obstacles.  The first is
that we can run code when an enemy collides with an obstacle.  In the game, this
means that the obstacle will be able to "defeat" one of the enemies.

The other thing you'll see in this mini-game is that we can disable
hero-obstacle collisions, even when everything else still collides with the
obstacle.  This lets us have a wall that the hero can run through, so it can
hide from an enemy that is chasing it.

<iframe src="game_09.iframe.html"></iframe>

To make this mini-game, we start with a hero:

```typescript
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
```

Next, we'll add two enemies.  Notice that I'm using `extra` to mark one as being "weak":

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 1, radius: 0.4 }, { dynamic: true }),
      movement: new ChaseMovement({ target: h, speed: 1 }),
      role: new Enemy(),
      extra: { weak: true }
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 2, radius: 0.4 }, { dynamic: true }),
      movement: new ChaseMovement({ target: h, speed: 1 }),
      role: new Enemy(),
      extra: { weak: false }
    });
```

Finally, we'll make an obstacle.  When making the `Obstacle` role, I've added
two things.  The first is `disableHeroCollision`, which lets the hero pass
through this wall.  The second is an `enemyCollision` function, which defeats
the enemy only if it is weak.

```typescript
    new Actor({
      appearance: new FilledBox({ width: 0.2, height: 2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 12, cy: 8, width: .2, height: 2 }),
      role: new Obstacle({
        disableHeroCollision: true, enemyCollision: (_o: Actor, e: Actor) => {
          if (e.extra.weak) (e.role as Enemy).defeat(true);
        }
      }),
    });
```
