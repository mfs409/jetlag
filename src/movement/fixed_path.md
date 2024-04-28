## Moving Along A Fixed Path

In many games, we need an actor to move along a path.  We're going to make a
very busy mess of a game.  Here's what it will look like when we're done:

<iframe src="game_02.iframe.html"></iframe>

In JetLag, we define a path as a set of waypoints.  When the level starts, the
actor will immediately teleport to the first waypoint, and start moving toward
the second, using the velocity we provide.  When it reaches that waypoint, it
will start moving toward the next.  When it reaches the last waypoint, if we
have requested that the path repeat, then it will instantly teleport back to the
first waypoint and start over.

We'll start by putting an actor into the world who moves via Tilt, so that we
can make it interact with an actor moving via a path.  Then we'll make an actor
who moves along a path and stops:

```typescript
    // Moving around in the world will make this more interesting!
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 8.6, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
    enableTilt(10, 10);

    // This actor moves to a position and stops
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: .5, cy: .5 }),
      role: new Obstacle(),
      movement: new PathMovement(new Path().to(.5, .5).to(15.5, .5), 2, false),
    });
```

Next, we'll add an actor who moves faster (5, instead of 2), and who loops.
Notice that the actor *teleports* back to the starting point.

```typescript
    // This actor loops, and is faster.  Also, actors on paths don't have to be
    // obstacles, they can have any role...
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: 1.5, cy: 1.5 }),
      role: new Enemy(),
      movement: new PathMovement(new Path().to(.5, 1.5).to(15.5, 1.5), 5, true),
    });

    // Since there's an enemy, we need a way to lose...
    stage.score.onLose = { level, builder }
```

If we want the actor to move back to the starting point, we need the final
waypoint to be the same as the first.

```typescript
    // The last one was a bit odd.  This one has *three* points.
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: 2.5, cy: 1.5 }),
      role: new Enemy(),
      movement: new PathMovement(new Path().to(.5, 2.5).to(15.5, 2.5).to(.5, 2.5), 5, true),
    });
```

Of course, paths can go from anywhere to anywhere... even off the screen.  Also,
notice that if an actor's body is static when the path is attached to it, it
will become kinematic, not dynamic.  That means that it can go through walls:

```typescript
    boundingBox();
    // Since we're going to make a complex path, let's use some code to make it:
    let p = new Path();
    let lastX = -.5;
    let lastY = 2;
    let up = true;
    while (lastX <= 16.5) {
      p.to(lastX, lastY);
      lastX += 1;
      if (up) lastY += 1; else lastY -= 1;
      up = !up;
    }
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: p.getPoint(0).x, cy: p.getPoint(0).y }),
      role: new Obstacle(),
      movement: new PathMovement(p, 5, true),
    });
```

If a point on the path is directly between two other points, you won't notice
it's there.  The velocity is all that matters.  At first, this might seem like a
kind of silly thing to point out...

```typescript
    let p2 = new Path().to(-.5, 5).to(8, 5).to(16.5, 5).to(-.5, 5);
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: p2.getPoint(0).x, cy: p2.getPoint(0).y }),
      role: new Obstacle(),
      movement: new PathMovement(p2, 5, true),
    });
```

But once we've done that, we can re-use the path, letting the next actor jump
forward by a waypoint.  Also, notice that when we do this, if we don't have the
`cx` and `cy` values correct, it's OK.  The actor teleports to its starting
point right away.

```typescript
    let a2 = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: p2.getPoint(0).x, cy: p2.getPoint(0).y }),
      role: new Obstacle(),
      movement: new PathMovement(p2, 5, true),
    });
    (a2.movement as PathMovement).skip_to(1);
```

We can make actors on paths dynamic.  This is usually a bad idea if collisions
are enabled (which is, of course, the default).  Try colliding with this actor
and knocking it off of its path.  It will mess up the whole path system.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: 2.5, cy: 1.5 }, { dynamic: true }),
      role: new Obstacle(),
      movement: new PathMovement(new Path().to(.5, 6.5).to(15.5, 6.5).to(.5, 6.5), 5, true),
    });
```

Lastly, let's observe that we can run code whenever an actor reaches a waypoint.
In this example, we'll only do something on the second waypoint (waypoint #1)
and the fourth waypoint (waypoint #3).  In each case, we'll just put a goodie up
in a location that's hard to reach.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: 2.5, cy: 7.5 }),
      role: new Obstacle(),
      movement: new PathMovement(new Path().to(-.5, 7.5).to(8, 8.5).to(16.5, 7.5).to(8, 8.5).to(-.5, 7.5), 5, true, (which: number) => {
        if (which == 1 || which == 3) {
          new Actor({
            appearance: new ImageSprite({ width: .5, height: .5, img: "grey_ball.png" }),
            rigidBody: new CircleBody({ radius: .25, cx: 1.5 - Math.random(), cy: 1.5 - Math.random() }, { dynamic: true }),
            role: new Goodie(),
          });
        }
      }),
    });
```

