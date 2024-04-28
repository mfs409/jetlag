## Using Revolute Joints To Drive Vehicles

In the following example, Box2D is doing a lot of work.  The wheels of the car
are not just spinning as a visual effect.  They are actually propelling the car
forward.  This requires friction, careful consideration about the weights of
things, and two revolute joints with motors.  Note that since JetLag only
supports one revolute joint per actor, we put the joints on the wheels, not on
the body of the car.

<iframe src="./game_03.iframe.html"></iframe>

In terms of how we get this behavior, all that really matters is that we don't
put any limits on the revolute joints.  That means they can keep spinning, just
like real tires, instead of halting when they reach some angle.

In the code for this example, we'll start by setting up gravity and a border.
We'll add friction to the bottom of the border:

```typescript
    stage.world.setGravity(0, 10);
    let sides = boundingBox();
    sides.b.rigidBody.setPhysics({ friction: 1 });
```

Next, we make the car as two wheels and a rectangle:

```typescript
    let car = new Actor({
      appearance: new FilledBox({ width: 2, height: 0.5, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 1, cy: 8, width: 2, height: 0.5 }),
      role: new Hero(),
    });

    // Connect a back wheel... heavy tires make for good traction
    let backWheel = new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.75, cy: 8.5, radius: 0.25 }, { density: 3, friction: 1 }),
      role: new Obstacle(),
    });

    // Connect a front wheel... it'll be all-wheel drive :)
    let frontWheel = new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 2.75, cy: 8.5, radius: 0.25 }, { density: 3, friction: 1 }),
      role: new Obstacle(),
    });
```

All that remains is to set up joints that connect the wheels to the body of the
car.  This car has all-wheel drive, because both wheels have motors.  You should
try different motor speeds, different torques, and front or rear-wheel drive (by
only giving one wheel or the other a motor).

```typescript
    backWheel.rigidBody.setRevoluteJoint(car, -1, 0.5, 0, 0);
    backWheel.rigidBody.setRevoluteJointMotor(10, 10);

    frontWheel.rigidBody.setRevoluteJoint(car, 1, 0.5, 0, 0);
    frontWheel.rigidBody.setRevoluteJointMotor(10, 10);
```
