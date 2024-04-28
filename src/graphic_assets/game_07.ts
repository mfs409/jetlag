import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { enableTilt, wideBoundingBox } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9};
  hitBoxes = true;
  // Here's where we name all the images/sounds/background music files.
  resources = {
    prefix: "./assets/",
    soundNames: [
      "flap_flap.ogg", "high_pitch.ogg", "low_pitch.ogg", "lose_sound.ogg",
      "slow_down.ogg", "win_sound.ogg"
    ],
    imageNames: [
      "alien.json", "sprites.json", "noise.png", "mid.png", "back.png"
    ]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // JetLag supports parallax backgrounds.  These can only be ImageSprite or
  // AnimatedSprite.
  wideBoundingBox();
  enableTilt(10, 0);
  stage.world.setGravity(0, 10);
  stage.world.camera.setBounds(0, 0, 32, 9);
  let h = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 1, cy: 8, radius: .5 }),
    movement: new TiltMovement(),
    role: new Hero()
  });
  stage.world.camera.setCameraFocus(h, 5, 0);
  stage.backgroundColor = "#4050D0";
  // These get layered in the order they are made.  You probably want them to
  // be layered from speed 1 down to speed 0.
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "back.png" }), speed: 1 })
  // Speed 0 is "same as hero"; Speed 1 is "seems not to move".  In between
  // will seem like layers in the distance.
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 })

  // JetLag also supports foregrounds.  They work in the same way :)
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
