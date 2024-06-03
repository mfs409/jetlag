import { Actor, BoxBody, ColorReplaceFilter, Container, Hero, HslAdjustmentFilter, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, PixiSprite, initializeAndLaunch, stage } from "../jetlag";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for a game in landscape mode, and 9/16 for a game in portrait mode
  aspectRatio = { width: 16, height: 9 };
  // Make this `false` when you're done debugging your game and are ready to
  // share it with the world.
  hitBoxes = true;
  resources = {
    prefix: "./assets/",
    imageNames: ["dude.json"],
  }
}

/**
 * Draw the first scene that shows when the game starts.
 *
 * @param level Which level of the game should be displayed
 */
function builder(_level: number) {
  // Create a container
  let c = new Container();
  // Do the body first, because everything else should go *in front of* it:
  let body_texture = stage.imageLibrary.getImageAsTexture("body.png").clone();
  c.addChild(new PixiSprite(body_texture));
  // The left and right arms are part of the same image
  let arms_texture = stage.imageLibrary.getImageAsTexture("arms.png").clone();
  c.addChild(new PixiSprite(arms_texture));
  // The left and right feet are part of the same texture
  let feet_texture = stage.imageLibrary.getImageAsTexture("feet.png").clone();
  c.addChild(new PixiSprite(feet_texture));
  // We need to do the head before the nose and mouth, so they will be "on top"
  // of it:
  let head_texture = stage.imageLibrary.getImageAsTexture("head.png").clone();
  c.addChild(new PixiSprite(head_texture));
  let nose_texture = stage.imageLibrary.getImageAsTexture("nose.png").clone();
  c.addChild(new PixiSprite(nose_texture));
  let mouth_texture = stage.imageLibrary.getImageAsTexture("mouth.png").clone();
  c.addChild(new PixiSprite(mouth_texture));
  // Now let's do the eyes, and use a filter to re-color them
  let eye_sprite = new PixiSprite(stage.imageLibrary.getImageAsTexture("eyes.png").clone());
  eye_sprite.filters = [new ColorReplaceFilter([255 / 255.0, 0, 0], [150 / 255, 75 / 255, 0 / 255], 0.001)];
  c.addChild(eye_sprite);
  // Lastly, we'll do the hair, and re-color it, too
  let hair_sprite = new PixiSprite(stage.imageLibrary.getImageAsTexture("hair_01.png").clone());
  hair_sprite.filters = [new HslAdjustmentFilter({ hue: -160, lightness: -.4, saturation: .5, colorize: true })];
  c.addChild(hair_sprite);

  // Now turn the whole container into a texture
  let new_texture = stage.renderer.pixi.renderer.generateTexture(c);

  // Create an actor from the texture
  // NB: the target image is 123x187 pixels
  let new_sprite = new PixiSprite(new_texture);
  let hero = new Actor({
    appearance: new ImageSprite({ width: 123 / 75, height: 187 / 75, img: new_sprite }),
    rigidBody: new BoxBody({ cx: 5, cy: 5, width: 123 / 75, height: 187 / 75 }, { disableRotation: true }),
    role: new Hero(),
    movement: new ManualMovement(),
  });

  // Pressing a key will change the hero's velocity
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(5));
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
