import { ColorReplaceFilter, HslAdjustmentFilter } from "pixi-filters";
import { Actor, BoxBody, FilledBox, FilledPolygon, GridSystem, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, PolygonBody, initializeAndLaunch, stage } from "../jetlag";
import { Container, Sprite as PixiSprite } from "pixi.js";

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
    prefix: "assets/",
    imageNames: ["dude.json"],
  }
}

/**
 * This function draws the first scene that shows when the game starts.  In this
 * code, it's an interactive world that cannot be won or lost.  After your game
 * starts becoming more polished, you will probably want to use several
 * functions like this one as a way to organize the parts of your game (levels,
 * chooser, welcome screen, store, etc).
 *
 * @param level Which level of the game should be displayed
 */
function builder(_level: number) {

  // Create an actor with no image
  // NB: the target image is 123x187 pixels
  let hero = new Actor({
    appearance: new ImageSprite({ width: 123 / 50, height: 187 / 50, img: "" }),
    rigidBody: new BoxBody({ cx: 5, cy: 5, width: 123 / 50, height: 187 / 50 }, { disableRotation: true }),
    role: new Hero(),
    movement: new ManualMovement(),
  });

  // Dump all the textures except hair and eyes onto it to make our character
  let c = new Container();
  for (let name of ["arms.png", "body.png", "feet.png", "head.png", "nose.png", "mouth.png"]) {
    let tbody = stage.imageLibrary.getImageAsTexture(name).clone();
    c.addChild(new PixiSprite(tbody));
  }
  // Now do the hair, and re-color it
  let thair = stage.imageLibrary.getImageAsTexture("hair_01.png").clone();
  let shair = new PixiSprite(thair);
  // consider hsl filter instead of ColorReplaceFilter?
  // shair.filters = [new ColorReplaceFilter([255 / 255.0, 255 / 255.0, 255 / 255.0], [5 / 255, 22 / 255, 84 / 255], 0.001)];
  shair.filters = [new HslAdjustmentFilter({ hue: -160, lightness: -.4, saturation: .5, colorize: true })];
  c.addChild(shair);
  // The eyes are the window to the soul
  let teyes = stage.imageLibrary.getImageAsTexture("eyes.png").clone();
  let seyes = new PixiSprite(teyes);
  seyes.filters = [new ColorReplaceFilter([255 / 255.0, 0, 0], [150 / 255, 75 / 255, 0 / 255], 0.001)];
  c.addChild(seyes);
  // Now turn the whole container into a texture and put it on the image
  let newT = stage.renderer.pixi.renderer.generateTexture(c);
  let newS = new PixiSprite(newT);
  (hero.appearance[0] as ImageSprite).overrideImage(newS);

  // Draw a grid on the screen, to help us think about the positions of actors.
  // Remember that when `hitBoxes` is true, clicking the screen will show
  // coordinates in the developer console.
  GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 16, y: 9 });

  // Make an obstacle that is a rectangle
  new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 4, width: 1, height: 1 }),
    appearance: new FilledBox({ width: 1, height: 1, fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
    role: new Obstacle(),
  });

  // Make an obstacle that is a polygon
  new Actor({
    rigidBody: new PolygonBody({ cx: 10, cy: 5, vertices: [0, -.5, .5, 0, 0, .5, -1, 0] }),
    appearance: new FilledPolygon({ vertices: [0, -.5, .5, 0, 0, .5, -1, 0], fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
    role: new Obstacle(),
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
