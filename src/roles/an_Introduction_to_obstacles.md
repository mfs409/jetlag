## An Introduction to Obstacles

We've already seen Obstacles, but just to recap, the default behavior for an
Obstacle is to act like a wall:

<iframe src="game_08.iframe.html"></iframe>

It doesn't take much code to create that level: we just have a hero and an
obstacle.  One thing to notice is that the default behavior of an obstacle is
that it is static, and its collisions are enabled, so the hero will collide with
it.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
      role: new Obstacle(),
    });
```
