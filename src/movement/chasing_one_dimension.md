## Chasing In One Dimension

`ChaseMovement` takes some *optional* parameters.  You can see them by hovering
your mouse over the word `ChaseMovement` in VSCode.  One that is quite useful is
to limit chasing to only one dimension (X or Y).  This can be useful for things
like a goalie in a hockey or soccer game, or a pong controller.  It can also
make for some nice visual effects.

<iframe src="game_04.iframe.html"></iframe>

In the code below, you'll notice that one of the red indicators has `chaseInX`
false, and the other has `chaseInY` false.

```typescript
    boundingBox();
    enableTilt(10, 10);

    // Make a hero who moves via tilt
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 5.25, cy: 5.25, radius: 0.4, }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    // These obstacles chase the hero, but only in one dimension
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 0, cy: 2.5, radius: 0.5 }),
      movement: new ChaseMovement({ speed: 10, target: h, chaseInX: false }),
      role: new Obstacle(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 2.5, cy: 0, radius: 0.5, }),
      movement: new ChaseMovement({ speed: 10, target: h, chaseInY: false }),
      role: new Obstacle(),
    });
```

In the next mini-game, we'll have an actor who only chases in one direction.
This level also shows some JetLag features.  You don't need to worry about
understanding them too well yet.  They're just here so that you can keep in mind
how little changes and small bits of code can make for very different styles of
gameplay.

<iframe src="game_05.iframe.html"></iframe>

In the level, we start with tilt in the X dimension, gravity, and a bounding
box:

```typescript
    enableTilt(10, 0);
    stage.world.setGravity(0, 10);
    boundingBox();
```

Next, we'll put in a background that auto-scrolls.  This can look very good in
some games, though in our game it doesn't look all that great.  The speed number
you see is something I found by guessing.  You'll want to change it until you
find a speed that works for your game concept.

```typescript
    stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: -5 / 1000, isAuto: true });
```

In this game, the hero can jump.  You can tap/click the hero to make it jump,
and when it does, it will get a boost upward (negative Y).  Using tilt while in
the air is the only way to get around the red ball.

```typescript
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      role: new Hero(),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }),
      movement: new TiltMovement(),
      gestures: { tap: () => { h.rigidBody.setVelocity(new b2Vec2(h.rigidBody.getVelocity().x, -10)); return true; } }
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      role: new Obstacle(),
      rigidBody: new CircleBody({ cx: 15, cy: 2, radius: 0.4 }, { dynamic: true }),
      movement: new ChaseMovement({ target: h, chaseInY: false, speed: 0.9 })
    });
```

