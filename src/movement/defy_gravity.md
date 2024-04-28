## Defying Gravity

We've seen that dynamic bodies are subject to gravity.  But we also require at
least one body in a collision to be dynamic, or the collision won't happen.
These requirements can be at odds with each other, so Box2D (and hence JetLag)
lets us defy gravity.  Here's a simple demonstration:

<iframe src="game_10.iframe.html"></iframe>


Below is the code for the demonstration.  The line of interest is
`setGravityDefy()`.  You'll notice that there is some strangeness to this code.
The issue is that `Destination` is a role that doesn't collide with other
things.  It achieves this by internally calling `setCollisionsEnabled(false)` on
its `rigidBody`.  If we want collisions, we need to turn them on *after* we make
the actor.  Every now and then, you'll find that JetLag is doing this sort of
thing... changing properties of a rigidBody during the `Actor.new()` call.  When
that happens, you can always change things back after the actor has been
created.

```typescript
    stage.world.setGravity(0, 10);
    boundingBox();

    // Destinations default to having collisions disabled.  We don't want this
    // to fly off screen, so we need to re-enable collisions, and we need to
    // make it dynamic.
    let d = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: 4, radius: 0.5 }, { dynamic: true }),
      movement: new ManualMovement(),
      role: new Destination(),
    });
    (d.movement as ManualMovement).setAbsoluteVelocity(-2, 0);
    d.rigidBody.setCollisionsEnabled(true);

    // But now that it's dynamic, gravity affects it, and it falls.  This fixes
    // it:
    (d.movement as ManualMovement).setGravityDefy();
```

