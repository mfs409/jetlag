## Violating The Laws Of Physics

In this next mini-game, we'll start building out something common in
"platformer" games: a hero who can jump onto a floating platform.

<iframe src="game_08.iframe.html"></iframe>

The most interesting thing about this mini-game is not what it does, but what it
doesn't do.  You should expect that when the hero (a box) is teetering off of
the edge of the platform, it should tip over.  That's what the laws of physics
say should happen.  Since that's not what we want in our game, it's up to us to
disable such behavior.  We do that by adding an explicit instruction that the
hero's rigid body shouldn't rotate.

Here's the start of the game: we have gravity, a border, and a hero who won't
accidentally rotate.  You should try turning the `false` to `true`, and watch
how the behavior of the Hero changes when it's walking off the platform.

```typescript
    // In the last level, there was a "disableRotation" parameter.  This can be
    // very useful, especially in platformer-type games.
    stage.world.setGravity(0, 10);
    boundingBox();

    // If we don't have the `disableRotation` option here, then if the hero just
    // barely nicks the corner of the platform, it will rotate as it falls!
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new BoxBody({ cx: 1, cy: 5.25, width: .8, height: .8 }, { disableRotation: false }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
```

Next, we make a floating platform.  Since it's an Obstacle, the hero won't pass
through it.  Since we didn't give it movement, it's a static body, so it won't
fall.

```typescript
    new Actor({
      appearance: new FilledBox({ width: 2, height: .25, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ width: 2, height: .25, cx: 4, cy: 7 }),
      role: new Obstacle(),
    });
```

One weird thing here is that jumping is a special behavior.  It's not part of
the movement, it's part of the hero role.  The reason for this is that in some
games, we need to know if something is "in the air".  The real thing to remember
here is that any time you're writing code, you'll find places where you have to
make decisions that aren't clean and obvious.  There are ways to rewrite JetLag
so that jumping is a movement, not a part of the Hero role.  I did it this way,
because it worked for my goals.  It's not objectively good or bad.

```typescript
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => ((hero.role as Hero).jump(0, -7.5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(-5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(5)));

    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));
```

