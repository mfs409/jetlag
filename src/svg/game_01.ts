import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, Obstacle, SvgSystem, TiltMovement, initializeAndLaunch } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9};
  hitBoxes = true;
  resources = {
    prefix: "./assets/",
    imageNames: ["sprites.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Drawing terrain by hand can be tedious.  In this level, we demonstrate
  // JetLag's rudimentary support for SVG files.  If you use Inkscape, or
  // another SVG tool, to make a picture that consists of only one line, then
  // you can import it into your game as a set of obstacles. Drawing a picture
  // on top of the obstacle is probably a good idea, though we don't bother in
  // this level
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
  // Notice that "shape.svg" is not in assets.  It gets loaded right here,
  // when we make the call to processFile.
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
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);