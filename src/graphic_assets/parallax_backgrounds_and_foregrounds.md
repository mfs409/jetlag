## Parallax Backgrounds and Foregrounds

Parallax backgrounds and foregrounds are the only situations in which that an
appearance is not associated with a rigid body.  They are also the only times
that a filled shape or `TextSprite` cannot be used in place of an `ImageSprite`.

These backgrounds and foregrounds give the appearance of depth, by scrolling at
different speeds.  Begin by downloading these two files and adding them to your
game's `imageNames`:

- [back.png](graphic_assets/back.png)
- [mid.png](graphic_assets/mid.png)

In our example, we'll only use background layers.  Foreground layers work in
exactly the same way.  Also, we'll only use `ImageSprite`, but once you complete
the tutorial on Animations, you'll be able to use `AnimatedSprite` as well.  Here's the mini-game we'll make:

<iframe src="./game_07.iframe.html"></iframe>

Let's begin by making a new function for drawing "wide" bounding boxes:

```typescript
/** Draw a bounding box that surrounds an extended (32m) world viewport */
function wideBoundingBox() {
  // Draw a box around the world
  new Actor({
    appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: -.05, width: 32, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: 9.05, width: 32, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 32.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
}
```

Now we can start putting code in our `builder()`.  To begin, let's set up the shape of the world:

```typescript
    wideBoundingBox();
    enableTilt(10, 0);
    stage.world.setGravity(0, 10);
    stage.world.camera.setBounds(0, 0, 32, 9);
```

Then we can add an actor who moves via tilt.  The camera will follow this actor:

```typescript
    let h = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 8, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero()
    });
    stage.world.camera.setCameraFocus(h, 5, 0);
```

Since our layers use transparency, we'll put a color in the background:

```typescript
    stage.backgroundColor = "#4050D0";
```

Then we can make our layers.  They will be displayed in the order they are made,
and we control their speed.  A speed of 0 means "same as the hero".  You can
think of this as the layer that is closest to the camera.  A speed of 1 means
"seems not to move".  This is usually the most distant background layer.  In
general, you'll probably want your background layers to be drawn in reverse
order of their speed... 0, then .8, then .5, then .2, then .1.  Our example only
has two layers, so this isn't too hard:

```typescript
    stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "back.png" }), speed: 1 })

    stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 })
```

Under the hood, JetLag will use the `imageMaker` to make as many copies of the
image as it needs, and it will stretch them according to their width/height.  It
uses the `anchor` as a reference point for where to draw the first image, and
then it makes more, to the left and right, as needed.

There are other options for backgrounds (and foregrounds), including those that
scroll vertically and those that scroll "automatically", even when the actors
aren't moving.  You may have seen some of these in other tutorials, so hopefully now they make more sense!
