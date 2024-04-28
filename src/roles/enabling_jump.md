## Enabling Jump

Another important property of Obstacles is that they serve as a "base" from
which a hero can jump.  Recall from the last tutorial set that jumping is a
property of the Hero role, not of the actor's movement.  This lets us detect
obstacle/hero collisions, and use them to re-enable jumping.

<iframe src="game_11.iframe.html"></iframe>

In this example, I wanted to show that sometimes when you press `SPACE` to make
the hero jump, it doesn't work.  The `console.log()` call will print to the
developer console (remember: you can open it with `F12`) every time the player
tries to make the hero jump.  When the hero is in the air, the call to `jump`
will not do anything.

We start by setting up gravity and a hero.  Pressing the space bar will try to
make the hero jup.  Notice that this mini-game has a "side" perspective:

```typescript
    stage.world.setGravity(0, 10);

    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    // By default, obstacles reenable jumping upon any collision, any side, so
    // colliding with a border will re-enable jumps
    let jump_attempts = 0;
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
      jump_attempts += 1;
      console.log("jump attempt " + jump_attempts);
      (hero.role as Hero).jump(0, -7.5);
    });
```

The floor, side walls, and ceiling all have the default behavior, which is that
any collision, from any side, will re-enable jumping by the hero.  Now let's add
a platform that only re-enabled jumping when the hero collides with its top.

```typescript
    // But this one only works from the top
    new Actor({
      appearance: new FilledBox({ width: 2, height: 2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 12, cy: 5, width: 2, height: 2 }),
      role: new Obstacle({ jumpReEnableSides: [DIRECTION.N] }),
    });
```

Before moving on, you should try to make changes to this code.  What happens if
you put `[DIRECTION.N, DIRECTION.S]`?  Can you repeatedly make the hero jump, so
that it seems to be stuck to the bottom of the platform?  Can you use the sides
to do "wall jumps" and reach the ceiling?
