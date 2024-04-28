import { Actor, BoxBody, CircleBody, Destination, Enemy, FilledBox, Hero, ImageSprite, JetLagGameConfig, ManualMovement, initializeAndLaunch, stage } from "../jetlag";
import { wideBoundingBox } from "./common";

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
    imageNames: ["sprites.json", "noise.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // There will be winning and losing in these tutorials, and we'll always want
  // to restart
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // We have a problem though... what if the world is bigger?  Does it really
  // make sense to cover the whole screen with the button?

  // In this level, we're going to cover the screen with a button.  Tapping
  // the button will make the hero jump
  wideBoundingBox();
  stage.world.setGravity(0, 10);
  stage.world.camera.setBounds(0, 0, 32, 9);

  // A background image, to help see that the hero is moving
  new Actor({
    appearance: new ImageSprite({ z: -2, width: 32, height: 9, img: "noise.png" }),
    rigidBody: new BoxBody({ cx: 16, cy: 4.5, width: .1, height: .1 }),
  });

  // A hero who can jump and who is moving
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 1, cy: 8.5, radius: 0.4 }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  (hero.movement as ManualMovement).setAbsoluteVelocity(5, 0);
  stage.world.camera.setCameraFocus(hero);

  // A destination to reach
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 27, cy: 6, radius: 0.4 }),
    role: new Destination(),
  });

  // If you don't make it, you'll lose
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 31.95, cy: 4.5, width: .1, height: 9 }),
    role: new Enemy(),
  });

  // A button for jumping
  new Actor({
    appearance: new FilledBox({ width: 0.1, height: 0.1, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }), // put it on the HUD
    gestures: { tap: () => { (hero.role as Hero).jump(0, -7.5); return true; } }
  });
}


// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
