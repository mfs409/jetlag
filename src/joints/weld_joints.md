## Weld Joints

Another type of joint can be used to "weld" two actors' bodies together.  This
can provide a "power up" to an item, or could be a way to show that an actor
needs to "pick up" an item and carry it, as in the example below:

<iframe src="./game_02.iframe.html"></iframe>

Let's start by making a world with some gravity, a border and a hero who moves
via tilt:

```typescript
    enableTilt(10, 10);
    stage.world.setGravity(0, 10);
    boundingBox();

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 4, cy: 8.5, radius: 0.4 }, { disableRotation: true }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
```

The "box" will just be an obstacle.  We'll give the obstacle a `heroCollision`
that uses `setWeldJoint()` to weld the box to the hero.  This function takes 6
arguments.  The first is the actor to weld, followed by two x,y pairs,
representing the offsets from the two actors' centers.  The last argument is an
angle (in radians), in case we want some rotation between the welded actors.

```typescript
    new Actor({
      appearance: new FilledBox({ width: .5, height: .5, fillColor: "#FF0000" }),
      // Note that for the weld joint to work, you probably want the obstacle to
      // have a dynamic body.
      rigidBody: new BoxBody({ width: .5, height: .5, cx: 7, cy: 8.5 }, { dynamic: true }),
      role: new Obstacle({
        heroCollision: (o: Actor, h: Actor) => {
          h.rigidBody.setWeldJoint(o, -.25, 0, .4, 0, 0);
        }
      }),
    });
```
