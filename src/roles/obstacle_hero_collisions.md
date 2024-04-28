## Obstacle-Hero Collisions

Similarly, we can run code when a hero collides with an obstacle:

<iframe src="game_10.iframe.html"></iframe>

The code for this level doesn't have many surprises.  The only tricky thing is
that we use `extra` to track if the hero has already been resized.  That lets us
avoid re-shrinking the hero every time it collides with the obstacle.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
      extra: { regular: true }
    });

    new Actor({
      appearance: new FilledBox({ width: 0.2, height: 2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 12, cy: 8, width: .2, height: 2 }),
      role: new Obstacle({
        heroCollision: (_o: Actor, h: Actor) => {
          if (h.extra.regular) {
            h.resize(.5);
            h.extra.regular = false;
          }
        }
      }),
    });
```
