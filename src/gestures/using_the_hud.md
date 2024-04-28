## Using The HUD

Our last mini-game worked, but it was a **bad design**.  The problem is that we
put the button in the world.  If we made the world bigger, the button could go
out of view.

In the next game, we'll put the invisible button *on the HUD*.  This is an
important point... since the world is large, putting the button on the HUD is
the only reasonable way to make sure it doesn't go out of view.

<iframe src="./game_02.iframe.html"></iframe>

To make this game, we'll start by setting up a wider bounding box, and then
setting the camera bounds:

```typescript
    wideBoundingBox();
    stage.world.setGravity(0, 10);
    stage.world.camera.setBounds(0, 0, 32, 9);
```

Any time the world gets large, and the camera centers on the hero, it's easy for
it to look like the hero isn't moving.  Having a varied background addresses the
problem, so we'll stretch `noise.png` to cover the visible world:

```typescript
    new Actor({
      appearance: new ImageSprite({ z: -2, width: 32, height: 9, img: "noise.png" }),
      rigidBody: new BoxBody({ cx: 16, cy: 4.5, width: .1, height: .1 }),
    });
```

Again, we'll make a hero, but this time we'll focus the camera on it:

```typescript
    // A hero who can jump and who is moving
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 8.5, radius: 0.4 }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    (hero.movement as ManualMovement).setAbsoluteVelocity(5, 0);
    stage.world.camera.setCameraFocus(hero);
```

Also, we'll make a destination and an enemy that covers the right wall of the
world, so that the level will restart if the hero doesn't reach the destination.

```typescript
    // A destination to reach
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 27, cy: 6, radius: 0.4 }),
      role: new Destination(),
    });

    // If you don't make it, you'll lose
    new Actor({
      appearance: new FilledBox({ width: .1, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 31.95, cy: 4.5, width: .1, height: 9 }),
      role: new Enemy(),
    });
```

Finally, we'll make our button, but this time we'll put it on the HUD:

```typescript
    // A button for jumping
    new Actor({
      appearance: new FilledBox({ width: 0.1, height: 0.1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }), // put it on the HUD
      gestures: { tap: () => { (hero.role as Hero).jump(0, -7.5); return true; } }
    });
```
