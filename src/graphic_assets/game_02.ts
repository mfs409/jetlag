import { Actor, CircleBody, ImageSprite, JetLagGameConfig, initializeAndLaunch } from "../jetlag";

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
  // We can also use images.  In this case, there is an image called
  // "noise.png" in the "assets" folder.  Up above, "assets" is the folder
  // name in the config object, and "noise.png" is listed as an image.  That
  // means we can use the image:
  new Actor({
    appearance: new ImageSprite({ width: 2, height: 2, img: "noise.png" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
  });
  // In almost all cases, you'll want to use PNG images, because they support
  // transparency.  Images are always squares, but transparency can make them
  // look like they have the same shape as their underlying rigidBody.

  // It's probably also a good idea not to put spaces in any of your file
  // names
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
