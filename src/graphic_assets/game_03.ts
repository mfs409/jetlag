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
  // Copying all your images into the "assets" folder and listing them all in
  // that array up above is tedious and error prone.  If you put in a bad
  // name, your developer console will give you an error.
  new Actor({
    appearance: new ImageSprite({ width: 2, height: 2, img: "bird.png" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
