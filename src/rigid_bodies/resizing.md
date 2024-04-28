## Resizing Actors

Rigid bodies can be resized at any time.  This means you can make things grow
and shrink slowly, by using a timer to make incremental changes to size, or you
can make things grow and shrink instantly (for example, in Super Mario Bros,
when "big Mario" takes damage, it becomes "little Mario").

It's important to resize both the appearance and rigidBody, so JetLag has a
`resize` method on actors.  Calling it will result in both the appearance and
rigidBody being resized.  This works for all kinds of rigidBody shapes, and all
kinds of appearances, so in the following example, we make lots of different
combinations of shape and appearance.  Tapping red things will make them shrink.
Tapping blue things will make them grow.  You'll notice that resizing text is a
bit weird.  The `Text` tutorial will help clear this up.

<iframe src="./game_08.iframe.html"></iframe>

The code below suffers from a lot of copy-and-paste.  While I usually think it
is a good idea to read every line, and to re-type code from these tutorials into
your own game, this is probably a case where it's fine to just make sure you
understand one or two actors, and then copy it and try it out.

```typescript
    enableTilt(10, 10);
    boundingBox();

    // A hero, for exploring the world
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 8, radius: 0.4, }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    // A circle.  Tap it to make it shrink a little bit
    new Actor({
      appearance: new FilledCircle({ radius: .5, fillColor: "#FF0000" }),
      rigidBody: new CircleBody({ cx: 2, cy: 2, radius: .5 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (shrinkCircle) => { shrinkCircle.resize(.8); return true; } },
      role: new Obstacle(),
      extra: { radius: .5 }
    });

    // A box.  Tap it to make it shrink a little bit
    new Actor({
      appearance: new FilledBox({ width: 1, height: 2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 4, cy: 2, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (shrinkBox) => { shrinkBox.resize(.8); return true; } },
      role: new Obstacle(),
    });

    // A circle.  Tap it to make it grow a little bit
    new Actor({
      appearance: new FilledCircle({ radius: .5, fillColor: "#0000FF" }),
      rigidBody: new CircleBody({ cx: 2, cy: 5, radius: .5 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (growCircle) => { growCircle.resize(1.2); return true; } },
      role: new Obstacle(),
    });

    // A box.  Tap it to make it grow a little bit
    new Actor({
      appearance: new FilledBox({ width: 1, height: 2, fillColor: "#0000FF" }),
      rigidBody: new BoxBody({ cx: 4, cy: 5, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (growBox) => { growBox.resize(1.2); return true; } },
      role: new Obstacle(),
    });

    // A circle with an image.  Tap it to make it shrink a little bit
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 6, cy: 2, radius: .5 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (shrinkCircleImage) => { shrinkCircleImage.resize(.8); return true; } },
      role: new Obstacle(),
    });

    // A box with an image.  Tap it to make it shrink a little bit
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 2, img: "red_ball.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 2, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (shrinkBoxImage) => { shrinkBoxImage.resize(.8); return true; } },
      role: new Obstacle(),
    });

    // A circle with an image.  Tap it to make it grow a little bit
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 6, cy: 5, radius: .5 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (growCircleImage) => { growCircleImage.resize(1.2); return true; } },
      role: new Obstacle(),
    });

    // A box with an image.  Tap it to make it grow a little bit
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 2, img: "blue_ball.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 5, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (growBoxImage) => { growBoxImage.resize(1.2); return true; } },
      role: new Obstacle(),
    });

    // A circle with text.  Tap it to make it shrink a little bit
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#FF0000" }, "hello"),
      rigidBody: new CircleBody({ cx: 10, cy: 2, radius: .5 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (shrinkCircleText) => { shrinkCircleText.resize(.8); return true; } },
      role: new Obstacle(),
    });

    // A box with text.  Tap it to make it shrink a little bit
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#FF0000" }, "hello"),
      rigidBody: new BoxBody({ cx: 12, cy: 2, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (shrinkBoxText) => { shrinkBoxText.resize(.8); return true; } },
      role: new Obstacle(),
    });

    // A circle with text.  Tap it to make it grow a little bit
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#0000FF" }, "hello"),
      rigidBody: new CircleBody({ cx: 10, cy: 5, radius: .5 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (growCircleText) => { growCircleText.resize(1.2); return true; } },
      role: new Obstacle(),
    });

    // A box with text.  Tap it to make it grow a little bit
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#0000FF" }, "hello"),
      rigidBody: new BoxBody({ cx: 12, cy: 5, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
      gestures: { tap: (growBoxText) => { growBoxText.resize(1.2); return true; } },
      role: new Obstacle(),
    });

    // A polygon.  Tap it to make it shrink a little bit
    new Actor({
      appearance: new FilledPolygon({ vertices: [-1, -1, 0, 1, -1, 1], fillColor: "#FF0000" }),
      rigidBody: new PolygonBody({ cx: 14, cy: 2, vertices: [-1, -1, 0, 1, -1, 1] }),
      gestures: { tap: (shrinkPoly) => { shrinkPoly.resize(.8); return true; } },
      role: new Obstacle(),
    });

    // A polygon.  Tap it to make it grow a little bit
    new Actor({
      appearance: new FilledPolygon({ vertices: [-1, -1, 0, 1, -1, 1], fillColor: "#0000FF" }),
      rigidBody: new PolygonBody({ cx: 14, cy: 5, vertices: [-1, -1, 0, 1, -1, 1] }),
      gestures: { tap: (growPoly) => { growPoly.resize(1.2); return true; } },
      role: new Obstacle(),
    });
```
