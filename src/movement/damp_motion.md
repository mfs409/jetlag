## Dampened Motion

One of the goals of this tutorial is to use movement as a way to learn more
about rigid bodies.  We just saw `disableRotation`.  Another thing we can do is
introduce `damping` factors.  These say that an actor's rigidBody should slow
down, not stop.  We can use damping on angular rotation and/or on velocity.
Here's an example.  Watch what happens when you stop using the arrows to move
the green ball.  Also, be sure to use `a` and `s` to apply rotation to the
actor.

<iframe src="game_09.iframe.html"></iframe>

Here's the code for the mini-game.  There are a few things to notice:

- We use a background layer, even though the camera isn't moving, because that's
  an easy way to get a background on the level.
- The background (`mid.png`) has transparency, so putting a background color on
  the stage works nicely.  You could even use a timer to slowly make the
  background darker, to simulate night falling.
- Due to a weird aspect of the language we're using (TypeScript), we can't just
  say `hero.movement.setDamping(1)`.  Instead, we have to remind the language
  that `hero.movement` is a `ManualMovement`, by using the syntax
  `(hero.movement as ManualMovement)`.

```typescript
    stage.world.setGravity(0, 0);
    boundingBox();

    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.75, height: 1.5, img: "green_ball.png" }),
      rigidBody: new BoxBody({ cx: 2, cy: 4, width: 0.75, height: 1.5, }),
      movement: new ManualMovement(),
      role: new Hero(),
    });

    // Be sure to turn off each of these, and watch what happens as the hero moves
    (hero.movement as ManualMovement).setDamping(1);
    (hero.movement as ManualMovement).setAngularDamping(1);

    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(-5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(-5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_A, () => ((hero.movement as ManualMovement).updateAngularVelocity(-1)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_S, () => ((hero.movement as ManualMovement).updateAngularVelocity(1)));

    stage.backgroundColor = "#17b4ff";
    stage.background.addLayer({ anchor: { cx: 8, cy: 4.5, }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 });
```

