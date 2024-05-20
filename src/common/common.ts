import { Actor, BoxBody, FilledBox, ImageSprite, KeyCodes, Obstacle, Scene, stage } from "../jetlag";

/**
 * Enable Tilt, and set up arrow keys to simulate it
 *
 * @param xMax  The maximum X force
 * @param yMax  The maximum Y force
 */
export function enableTilt(xMax: number, yMax: number) {
  stage.tilt.tiltMax.Set(xMax, yMax);
  if (!stage.accelerometer.tiltSupported) {
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
  }
}

/**
 * Draw a bounding box that surrounds a default 16x9 world
 *
 * @returns The walls in an object {t, b, l, r}
 */
export function boundingBox() {
  // Draw a box around the world
  let t = new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: -.05, width: 16, height: .1 }),
    role: new Obstacle(),
  });
  let b = new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 9.05, width: 16, height: .1 }),
    role: new Obstacle(),
  });
  let l = new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  let r = new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  return { t, b, l, r };
}

/** Draw a bounding box that surrounds a 32x9 world */
export function wideBoundingBox() {
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
export function drawMuteButton(cfg: { cx: number, cy: number, width: number, height: number, scene: Scene }) {
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
