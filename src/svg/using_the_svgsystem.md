## Using the SvgSystem

Here is the game we are going to make.  It's really quite ugly, but hopefully it
is enough to get you thinking about how SVG can be useful for some kinds of
games.

<iframe src="./game_01.iframe.html"></iframe>

This level doesn't take much code to write: we just set up an actor, and then
use `SvgSystem.processFile()` to process the shape.

```typescript
    enableTilt(10, 10);
    boundingBox();

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { density: 5, friction: 0.6 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    // draw an obstacle from SVG.  We are stretching it in the X and Y
    // dimensions, and also moving it rightward and downward
    //
    // Notice that "shape.svg" is just a file in assets.  We didn't load it 
    // through the `Config` object.  Instead, it gets loaded right here, when we
    //  make the call to processFile.
    SvgSystem.processFile("shape.svg", 2, 2, 1.5, 1.5, (centerX: number, centerY: number, width: number, rotation: number) => {
      // Make an obstacle and rotate it
      let a = new Actor({
        appearance: new FilledBox({ width, height: 0.05, fillColor: "#FF0000" }),
        rigidBody: new BoxBody({ cx: centerX, cy: centerY, width, height: 0.05 }),
        role: new Obstacle(),
      });
      a.rigidBody.setRotation(rotation);
      a.rigidBody.setPhysics({ density: 1, elasticity: .2, friction: .4 });
    });
```

In the call to `processFile()`, we pass in  the name of the shape file.  JetLag
will download it on demand, in response to the call to `processFile()`.  The
other arguments to the function are x,y coordinates for the top left corner of
the shape, and then amounts to stretch the shape in the x and y dimensions.
Lastly, there's a function that actually makes actors.

When `processFile()` works through the line segments, it will transform any
curves into straight lines (you could, instead, ask InkScape not to make
curves).  Then, for each line, it calls the code you provide.  When it calls
this function, it indicates that the current line segment should be drawn as a
thin rectangle with the provided center coordinates, dimensions, and rotation.
In the code above, you can see how these are applied to the rigid body.

Since you provide the code for making the line segments, you have total control:
you can change the appearance, customize the physics properties of the rigid
body, assign a role, and so forth.

If we were making a real game, we'd probably want to put an actor on top of the
lines we just drew, so that things would look better.  What we draw, and how,
would most likely depend on what effect we were trying to achieve.  Similarly,
we might want our function to count how many times it was called... the lines
will always be drawn in the same order, so in some situations, your code will
know that it needs to do some kind of special configuration on the 14th actor,
or it needs to put the first 6 actors into an array so it can do more with them
later.
