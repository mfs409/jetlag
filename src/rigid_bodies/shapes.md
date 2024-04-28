## Rigid Body Shapes

In a previous tutorial, we saw that each rigidBody can have one of three shapes:
a box (rectangle), a circle, or a convex polygon.  Let's make a game that shows
all of these options.

<iframe src="./game_04.iframe.html"></iframe>

In our game, it's really important that the `Config` object set `hitBoxes` to
`true`, because it lets us see the outline of the rigidBody... even when there's
an image covering it.  In the code for this example, notice that we're providing
different additional configuration information to the rigidBodies than we did
previously.  If you hover your mouse over `CircleBody` or `BoxBody` or
`PolygonBody`, you'll see a list of all the possible options.

```typescript
    // Turn on tilt and put a box around the world
    enableTilt(10, 10);
    boundingBox();

    // Circles need a radius.
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: 1, cy: 1 }, { rotationSpeed: 5 }),
      role: new Obstacle(),
    });

    // Boxes have a width and a height
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 2, img: "blue_ball.png" }),
      rigidBody: new BoxBody({ width: 1, height: 2, cx: 3, cy: 2 }, { rotationSpeed: -.25 }),
      role: new Obstacle(),
    });

    // To make a polygon, we provide an array with the vertices.  Note that two
    // entries in a row will represent x and y coordinates of a vertex.
    //
    // Polygons can have as many points as you want (but more than 8 is usually
    // crazy), but the polygon needs to be convex.  Points are described in
    // terms of their distance from the center.  So, for example, here's a
    // circular image with a hexagonal body.
    new Actor({
      appearance: new ImageSprite({ width: 2, height: 2, img: "blue_ball.png" }),
      rigidBody: new PolygonBody(
        { cx: 6, cy: 6, vertices: [-1, 0, -.5, .866, .5, .866, 1, 0, .5, -.866, -.5, -.866] },
        { rotationSpeed: .25 }),
      role: new Obstacle(),
    });

    // The polygon's center (x,y) need not be its true center:
    new Actor({
      appearance: new ImageSprite({ width: 2, height: 2, img: "blue_ball.png" }),
      rigidBody: new PolygonBody(
        { cx: 13, cy: 6, vertices: [-1, 0, 0, 1, 1, 0] },
        { rotationSpeed: .25 }),
      role: new Obstacle(),
    });

    // Let's also draw an obstacle that is oblong (due to its width and height)
    // and that is rotated. Note that this should be a box, or it will not have
    // the right underlying shape.
    let o = new Actor({
      appearance: new ImageSprite({ width: 0.75, height: 0.15, img: "blue_ball.png" }),
      rigidBody: new BoxBody({ cx: 13, cy: 3, width: 0.75, height: 0.15, }),
      role: new Obstacle(),
    });
    o.rigidBody.setRotation(Math.PI / 4);

    // This actor can move around and experience the other actors' shapes
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Obstacle(),
    });
```

In the mini-game, be sure to use the arrows to make the green ball move around
and interact with the other shapes.  You should see that Box2D is doing quite a
bit to make the interactions between shapes behave like it would in the real
world.

Before moving on, there are two things worth trying:

- Watch what happens if you take away the green ball's role.  If you do this, it
  will get the default role, which is `Passive`.  Passive actors don't collide
  with anything, so your green ball will now pass through all the obstacles.
- It's possible to override the behavior of tilt, so that it applies a
  *velocity* instead of a force.  Try adding these lines, and watching how the
  movement of the actor changes:

```typescript
    // While we're at it, we're going to change how tilt works... let's make it
    // affect velocity directly, instead of inducing forces:
    stage.tilt.tiltVelocityOverride = true;
```
