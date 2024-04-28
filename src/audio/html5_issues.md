## HTML5 Issues

Since JetLag is based on web technologies (HTML5, JavaScript, CSS), it is
subject to some rules that relate to web browsers.  The most important of these
is that a web page can't start playing sounds until there is some gesture on the
page.

In addition, it's a good idea to have a way to let the person playing your game
mute and un-mute the game.  Putting both of these ideas together, it's going to
be useful to have a function like this, for drawing a button that mutes/unmutes.

```typescript
/**
 * Draw a mute button
 *
 * @param cfg         Configuration for how to draw the button
 * @param cfg.scene   The scene where the button should be drawn
 * @param cfg.cx      The center X coordinate of the button
 * @param cfg.cy      The center Y coordinate of the button
 * @param cfg.width   The width of the button
 * @param cfg.height  The height of the button
 */
function drawMuteButton(cfg: { cx: number, cy: number, width: number, height: number, scene: Scene }) {
  // Draw a mute button
  let getVolume = () => (stage.storage.getPersistent("volume") ?? "1") === "1";
  let mute = new Actor({
    appearance: new ImageSprite({ width: cfg.width, height: cfg.height, img: "audio_off.png" }),
    rigidBody: new BoxBody({ cx: cfg.cx, cy: cfg.cy, width: cfg.width, height: cfg.height }, { scene: cfg.scene }),
  });
  // If the game is not muted, switch the image
  if (getVolume())
    (mute.appearance[0] as ImageSprite).setImage("audio_on.png");
  // when the obstacle is touched, switch the mute state and update the picture
  mute.gestures = {
    tap: () => {
      // volume is either 1 or 0, switch it to the other and save it
      let volume = 1 - parseInt(stage.storage.getPersistent("volume") ?? "1");
      stage.storage.setPersistent("volume", "" + volume);
      // update all music
      stage.musicLibrary.resetMusicVolume(volume);

      if (getVolume()) (mute.appearance[0] as ImageSprite).setImage("audio_on.png");
      else (mute.appearance[0] as ImageSprite).setImage("audio_off.png");
      return true;
    }
  };
}
```

You'll definitely want to put `sprites.json` in your `imageNames`, so that the
two images are available (or better yet, you could make your own images, which
will probably look better than these!).  You'll also notice that this mute
button uses "persistent" storage.  We'll discuss that more in a later tutorial.
For now, just know that it means your mute button will preserve its state even
if you close and re-open the game.
