## More About Jumping

Any time it's possible to jump, there's a chance that we would want
double-jumps.  In JetLag, we can have any finite number of jumps, by giving the
hero a `numJumpsAllowed` value.  Here's an example:

<iframe src="game_13.iframe.html"></iframe>

And here's the code for the example.  Notice that the default is for obstacles
to re-enable jumping upon any collision (on any side).  This means that
colliding with borders will re-enable jumps.  This will probably lead to some
weird glitches.

```typescript
    stage.world.setGravity(0, 10);

    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero({ numJumpsAllowed: 2 }),
    });

    let jump_attempts = 0;
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
      jump_attempts += 1;
      console.log("jump attempt " + jump_attempts);
      (hero.role as Hero).jump(0, -7.5);
    });
```

Remember to look at the developer console (F12) for messages about when the hero
tried to jump.

Since jumping is just applying an impulse, some games benefit from "infinite"
multi-jump.  Examples include swimming games and flying games like Flappy Bird:

<iframe src="game_14.iframe.html"></iframe>

You should try to use this code, along with what you've seen about camera
boundaries and parallax, to make something that feels kind of like a Flappy Bird
clone.

```typescript
    stage.world.setGravity(0, 10);

    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero({ allowMultiJump: true }),
    });

    let jump_attempts = 0;
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
      jump_attempts += 1;
      console.log("jump attempt " + jump_attempts);
      (hero.role as Hero).jump(0, -7.5);
    });
```
