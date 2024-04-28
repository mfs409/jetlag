## HUD Gestures That Interact With The World

In the previous example, pan was controlling an actor who was in `stage.world`,
but the joystick did not *feel* like part of the world.

Let's go back to the tap gesture now, but this time, we'll say that whenever you
tap the top half of the screen, some new actor should be created *in the world*.
Since the button is on the HUD, we'll need a way to translate from HUD
coordinates to world coordinates.

<iframe src="./game_04.iframe.html"></iframe>

To start writing this mini-game, we'll make a wide world and put a hero in it.
The hero will move rightward with a fixed velocity, and we'll put a background
image on the world:

```typescript
    wideBoundingBox();
    stage.world.setGravity(0, 10);
    stage.world.camera.setBounds(0, 0, 32, 9);
    new Actor({
      appearance: new ImageSprite({ z: -2, width: 32, height: 9, img: "noise.png" }),
      rigidBody: new BoxBody({ cx: 16, cy: 4.5, width: .1, height: .1 }),
    });

    // A hero who is moving
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 8.5, radius: 0.4 }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    (hero.movement as ManualMovement).setAbsoluteVelocity(5, 0);
    stage.world.camera.setCameraFocus(hero);
```

We'll draw a button on the top half of the HUD.  The `appearance` and
`rigidBody` should be pretty easy to figure out.  But the `tap()` gesture code
will be kind of tricky.

In the code below, you'll see that `tap()` actually receives two parameters: the
actor who was tapped, and the coordinates of the tap.  These coordinates are
within the world where the actor exists, so in this code, I gave them the name
`hudMeters`, to remind myself that the unit is meters, and the coordinates are
related to the HUD.  I could have called them anything, but meaningful names
make it easier to understand tricky code.  And to be honest, *all code is tricky
code*.  That may seem ridiculous to say, because when you write code, and you
get it to work, it seems easy.  But when you write big programs (like games!),
you might not look at some code for weeks, or months.  In that case, you'll be
much happier if you put good comments in your code and used good variable names
when you wrote it.

Getting back to the code: we need to translate the coordinates from HUD to
world.  The trick is that JetLag's cameras understand how to translate back and
forth between their associated world and the coordinates of the physical screen.
So in the code below, we can use `stage.hud.camera.metersToScreen()` to turn the
HUD meter coordinates into raw pixel coordinates, and then use
`stage.world.camera.screenToMeters()` to turn those raw pixel coordinates into
meter coordinates in the world.  Once we have those coordinates, we can make a
goodie at the location where the touch happened.  Giving it a `GravityMovement`
is a nice effect.

```typescript
    new Actor({
      appearance: new FilledBox({ width: 0.1, height: 0.1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 2.25, width: 16, height: 4.5 }, { scene: stage.hud }), // put it on the HUD
      gestures: {
        tap: (_actor: Actor, hudMeters: { x: number, y: number }) => {
          // We need to translate the coordinates from the HUD to the world.  We
          // do that by turning them into screen coordinates, then turning them
          // back.
          let screenPixels = stage.hud.camera.metersToScreen(hudMeters.x, hudMeters.y);
          let worldMeters = stage.world.camera.screenToMeters(screenPixels.x, screenPixels.y);
          new Actor({
            appearance: new ImageSprite({ width: .5, height: .5, img: "blue_ball.png" }),
            rigidBody: new CircleBody({ cx: worldMeters.x, cy: worldMeters.y, radius: .25 }),
            movement: new GravityMovement(),
            role: new Goodie(),
          });
          return true;
        }
      }
    });
```
