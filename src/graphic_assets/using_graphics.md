## Using Graphics

Since JetLag uses Pixi.js to draw to the screen, you can use any image format
that Pixi.js understands.  This includes .png, .jpg, .webp, and many other
formats.  However, not all formats are equally beneficial.  In particular, .png
tends to be among the most useful, because it has support for transparency, and
it does not use "lossy" compression.  That means your .png images won't be
blurry, unless you stretch them too much.

Below are links to two images:

- [green_ball.png](graphic_assets/green_ball.png)
- [noise.png](graphic_assets/noise.png)

Every image is a rectangle, but the green ball uses transparency to *seem* like
it's a circle.  This is a key idea in games... your image assets need to use
transparency if you don't want them to be rectangles.

For now, only add `noise.png` to your `Config`'s `imageNames` array.  Then
replace `builder()`'s code with the following:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 2, height: 2, img: "noise.png" }),
      rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
    });
```

You should see something like this:

<iframe src="./game_02.iframe.html"></iframe>

Next, add `green_ball.png` to your `imageNames`, and then change `noise.png` to
`green_ball.png`.  Since the rigid body is a circle, the green ball is a much
better choice.

Also, remember that right now, `hitBoxes` is `true`.  If you set it `false`, the
outline of the rigid body will no longer show... you'll want to do that when you
release your game, but during development, it's probably a good idea to keep the
hit boxes turned on.
