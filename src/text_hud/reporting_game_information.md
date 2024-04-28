## Reporting Game Information

When we use the "producer" form (`()=>{}`) to generate the text for a
`TextSprite`, we gain the power to report on the status and behavior of any
actor in the world.  Here's an example, where our text reports the hero's
coordinates:

<iframe src="./game_06.iframe.html"></iframe>

We start this mini-game by creating a hero who moves via keyboard, and centering
the camera on it:

```typescript
    let hero = new Actor({
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .5 }),
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      movement: new ManualMovement({ rotateByDirection: true }),
    });

stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).addVelocity(-1, 0))
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).addVelocity(1, 0))
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).addVelocity(0, -1))
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).addVelocity(0, 1))

    stage.world.camera.setCameraFocus(hero);
```

Then we can put a text box on the screen that reads the hero's position and
displays it.

```typescript
    new Actor({
      rigidBody: new CircleBody({ cx: .5, cy: .5, radius: .001 }),
      appearance: new TextSprite(
        { center: false, face: "Arial", size: 20, color: "#FF0000aa" },
        () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
    });
```

However, this brings up a new problem... the text is part of the `world`, and
the hero can move very far away from where we drew the text.  When that happens,
we can't see the text anymore.  (We'll ignore how, without a background, it
doesn't really look like the hero is moving.)

The solution to this problem is a very small bit of code, but a very big idea.
In JetLag, the `stage` actually has two independent physics simulations running
at all times.  One is the `stage.world`.  The other, which is slightly less
powerful, is the `stage.hud` (heads-up display).  The best way to think about
the hud is to think "sometimes, I don't want to draw an actor on the world,
instead I want to draw it *on the camera itself*".

We can put any actor on the HUD by adding some configuration to the rigid body:

```typescript
      rigidBody: new CircleBody({ cx: .5, cy: .5, radius: .001 }, { scene: stage.hud }),
```

<iframe src="./game_07.iframe.html"></iframe>```

And with that tiny change, the text will stay right where we want it.  Be sure
to open the developer console (`F12`) and compare the "World Touch" and "Hud
Touch" values as you move around in the world.  You'll see that the HUD stays in
a fixed position.
