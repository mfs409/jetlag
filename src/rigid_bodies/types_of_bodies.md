## Types Of Rigid Bodies

In Box2D, a rigid body can have one of three different types.

- Static bodies don't move at all, ever.
- Kinematic bodies can move, but are not subject to forces
- Dynamic bodies can move, and are subject to forces

We're going start our exploration of this idea through the following game:

<iframe src="./game_01.iframe.html"></iframe>

In builder, we'll start by turning on Tilt and drawing a bounding box:

```typescript
    // We will use tilt to control the hero, with arrow keys simulating
    // tilt on devices that lack an accelerometer
    enableTilt(10, 10);
    boundingBox();
```

Next, let's make an actor who moves via Tilt.  Note that attaching a
`TiltMovement` component automatically transforms the body to be dynamic.
Actually, attaching a `Hero` component also automatically transforms the body to
be dynamic.  So this hero is **definitely** dynamic.

```typescript
    // The actor who can move
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(), // This makes it dynamic
      role: new Hero(),
    });
```

Next, we'll draw three obstacles.  Obstacles default to being static, but we'll
override that for the second and third obstacle.

```typescript
    let s = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 4, cy: 4, radius: 0.4 }),
      role: new Obstacle(), // Defaults to static
    });

    let k = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 6, cy: 4, radius: 0.4 }, { kinematic: true }),
      role: new Obstacle(), // The prior line overrides to kinematic
    });

    let d = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 4, radius: 0.4 }, { dynamic: true }),
      role: new Obstacle(), // This one is overridden to be dynamic
    });
```

Right now, the kinematic and static obstacles don't seem to have any difference
in their behavior.  Let's see what happens when we give each of the obstacles
some velocity:

```typescript
    k.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })
    d.rigidBody.body.SetLinearVelocity({ x: -1, y: 0 })
    s.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })
```

You'll notice that *a lot* just changed:

- The static obstacle still doesn't move
- The kinematic and dynamic obstacles collide, but only the dynamic one
  experiences a transfer of momentum.
- The kinematic obstacle does not detect a collision with the wall, so it passes
  through it.

Let's add a few more kinematic and static obstacles:

```typescript
    let k1 = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 6, cy: 2, radius: 0.4 }, { kinematic: true }),
      role: new Obstacle(),
    });
    let k2 = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 2, radius: 0.4 }, { kinematic: true }),
      role: new Obstacle(),
    });
    k1.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })
    k2.rigidBody.body.SetLinearVelocity({ x: -1, y: 0 })

    let d1 = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 6, cy: 6, radius: 0.4 }, { dynamic: true }),
      role: new Obstacle(),
    });
    let d2 = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 6, radius: 0.4 }, { dynamic: true }),
      role: new Obstacle(),
    });
    d1.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })
    d2.rigidBody.body.SetLinearVelocity({ x: -1, y: 0 })
```

Here's the complete game:

<iframe src="./game_02.iframe.html"></iframe>

In the game, you can see that the kinematic obstacles "pass through" each other,
and retain their velocity.  The dynamic obstacles experience a transfer of
momentum, which means they both just stop.  If you made one move faster than the
other, you'd see a different transfer of momentum.

The other important issue here is that the dynamic bodies are subject to forces.
We saw some version of this idea in the way that there was a transfer of
momentum between static and dynamic bodies, and from kinematic bodies to dynamic
bodies.  It also explains why the dynamic body bounces off of the static body.

In the last tutorial, we added gravity, which is a force.  Let's add gravity to
this level, and see what happens.  We just need to add one line:

```typescript
    // Note: you could have negative gravity, to make things float upward...
    stage.world.setGravity(0, 10);
```

Now all of the dynamic bodies start falling, while the static and kinematic ones
do not!  (To make it a bit clearer, my live demo takes out those extra obstacles
that we had just added.)

<iframe src="./game_03.iframe.html"></iframe>
