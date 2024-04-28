## A Simple Revolute Joint

Our first example will create a "revolute" joint.  As you probably guessed, this
joint lets one actor revolve (not rotate!) around another actor.

<iframe src="./game_01.iframe.html"></iframe>

In the code, you'll see two actors, one of which is being called `anchor`.  This
is an essential concept: the anchor defines the pivot point around which the
other actor will revolve.

```typescript
    // In this level, a joint relates the rectangle to the circle.  The circle
    // is the pivot point, and the rectangle rotates around it
    let revolving = new Actor({
      appearance: new FilledBox({ width: 5, height: 1, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 1.5, cy: 4, width: 5, height: 1, }),
      role: new Obstacle(),
    });

    let anchor = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 7.5, cy: 4, radius: 0.5 }),
      role: new Obstacle(),
    });
```

Next, we connect the two actors by creating a joint between their rigid bodies.
The joint takes two x,y pairs.  These are offsets: we add the first to the
anchor's center, and the second to the revolving actor's center.  The joint will
actually be between those points.  Then we set limits (in radians) on the joint,
so that it can only move so far in either direction, and we attach a motor.  In
this case, the motor runs at half a radian per second, with infinite torque.

```typescript
    revolving.rigidBody.setRevoluteJoint(anchor, 0, 0, 0, 2);
    // Add some limits and give some speed to make it move
    revolving.rigidBody.setRevoluteJointLimits(1.7, -1.7);
    revolving.rigidBody.setRevoluteJointMotor(0.5, Number.POSITIVE_INFINITY);
```

Code like that could serve as a flipper in a pinball-style game, if we didn't
attach a motor until some event happened.  But we'd need a way to re-set the
flipper later.  Let's add a timer, so that after 5 seconds, we can change the
motor properties and move in the opposite direction:

```typescript
    // Notice that we can change the motor at any time...
    stage.world.timer.addEvent(new TimedEvent(5, false, () => {
      // The order in which we do these changes doesn't matter :)
      revolving.rigidBody.setRevoluteJointMotor(-.5, Number.POSITIVE_INFINITY);
      revolving.rigidBody.setRevoluteJointLimits(1.7, -.5);
    }));
```
