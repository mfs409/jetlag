## Getting Started

When you made your `Config` object in previous tutorials, you weren't allowed to
omit any fields... everything was mandatory.  It turns out that in JetLag, there
is also an optional field for listing video assets.  Let's start a new game and
set it up like most of our previous tutorials.  We'll use the `sprites.json` and
`sprites.png` files from before, and we'll also want to have the `enableTilt`
and `boundingBox` functions.  And now you should also add this to your `assets/`
folder:

- [Big Buck Bunny](assets/big_buck_bunny.mp4)

(If you're wondering, this video is a clip from [Big Buck
Bunny](https://en.wikipedia.org/wiki/Big_Buck_Bunny), a royalty-free video that
was originally released in 2008.  It is commonly used for tutorials, video
tests, etc., because of its permissive Creative Commons license.)

Next we can set up our `Config` with an extra line for the `videoNames`:

```typescript
class Config implements JetLagGameConfig {
  pixelMeterRatio = 100;
  screenDimensions = { width: 1600, height: 900 };
  adaptToScreenSize = true;
  canVibrate = true;
  accelerometerMode = AccelerometerMode.DISABLED;
  storageKey = "--no-key--";
  hitBoxes = true;
  resourcePrefix = "./assets/";
  musicNames = [];
  soundNames = [];
  imageNames = ["sprites.json"];
  videoNames = ["big_buck_bunny.mp4"]; // All video names
}
```

