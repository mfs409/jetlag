## Changing The Hero's Behavior With Sensors

The last role we'll look at in this tutorial is the Sensor role.  Sensors detect
when they collide with a hero, and they run some code.  In this example, we have
three sensors, each of which affects the hero's movement:

<iframe src="game_07.iframe.html"></iframe>

To make this mini-game, we start by creating a hero.  We'll control it via Tilt:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
```

Next, we draw the sensors.  Notice how I'm using the `z` of the appearance to
determine which go under or over the hero.  Also remember that if two things
have the same z (the default is 0), then the one we make second will go "on top
of" the one we make first.

Sensors always have a `heroCollision` function.  It always provides the sensor
and hero as arguments to the function.  The sensor comes first.  Since we don't
use it in our code, we prefix the name with an underscore (e.g., `_self`), so
that TypeScript knows that we intended not to use it.

```typescript
    // This pad effect multiplies by -1, causing a "bounce off" effect even
    // though collisions are not enabled
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ cx: 5, cy: 3, radius: 0.4 }),
      role: new Sensor({
        heroCollision: (_self: Actor, h: Actor) => { h.rigidBody!.setVelocity(h.rigidBody!.getVelocity().Scale(-10)); }
      }),
    });

    // This pad multiplies by five, causing a speedup
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ cx: 7, cy: 3, radius: 0.4 }),
      role: new Sensor({
        heroCollision: (_self: Actor, h: Actor) => { h.rigidBody!.setVelocity(h.rigidBody!.getVelocity().Scale(5)); }
      }),
    });

    // A fraction causes a slowdown
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ cx: 9, cy: 3, radius: 0.4 }, { rotationSpeed: 2 }),
      role: new Sensor({
        heroCollision: (_self: Actor, h: Actor) => { h.rigidBody!.setVelocity(h.rigidBody!.getVelocity().Scale(0.2)); }
      }),
    });
```
