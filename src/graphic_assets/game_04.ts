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
  // Things are much easier if you use a tool like TexturePacker
  // (https://www.codeandweb.com/texturepacker).  You can drop a bunch of
  // images into it, and it gives you back *one* png and *one* json file.  You
  // can put the two files into your assets folder, and then just put the json
  // file into the array up above.  Then you can use the names of the files,
  // just like before.
  new Actor({
    appearance: new ImageSprite({ width: 2, height: 2, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
