## Density, Elasticity, and Friction

In the last level, it may have seemed odd that the green ball doesn't roll along
the ground, and doesn't start spinning when it interacts with the spinning
circle.  The reason for this is that actors have no friction by default.  When
making a rigidBody, you can specify the density, elasticity, and friction.
Here's a very brief demonstration:

<iframe src="./game_06.iframe.html"></iframe>

Below is the code.  You'll notice that the increased density makes the actors
heavier.  Tilt forces take more work to get them moving, and they are harder to
stop.  They also will transfer momentum differently based on their density.

Notice, too, that even though they both look like circles, one is actually a
box.  Boxes have more area, so even at the same density, it will be heavier.

We also added friction.  One important thing about friction is that we need it on
*both* surfaces if we want things to have a friction interaction.  For circles,
friction makes them roll.  For boxes, it makes them slide to a halt.

Lastly, you'll notice that we can change these physics properties after the
fact.  To show this, the code adds some elasticity to the left wall, and some
friction to the bottom wall.

```typescript
    enableTilt(10, 10);

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }, { density: 5, friction: .3 }),
      movement: new TiltMovement(),
      role: new Obstacle(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new BoxBody({ cx: 4, cy: 3, width: .8, height: .8 }, { density: 5, friction: .3 }),
      movement: new TiltMovement(),
      role: new Obstacle(),
    });

    // boundingBox returns the four walls.  We can customize their physics 
    // properties:
    let walls = boundingBox();
    walls.b.rigidBody.setPhysics({ friction: .4 });
    walls.l.rigidBody.setPhysics({ elasticity: .2 });
```

Before moving on to the next example, be sure to change some numbers and see how
the actor behavior changes.  Also, make sure to move things around enough while
playing the game, so that you can get a better feel for how density, elasticity,
and friction affect gameplay.  Be sure to do silly things, too, like giving
something an elasticity of 100.
