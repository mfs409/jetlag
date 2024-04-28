import { Actor, AnimatedSprite, AnimationSequence, AnimationState, BoxBody, Hero, JetLagGameConfig, ManualMovement, initializeAndLaunch } from "../jetlag";

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
  // In the previous animation examples, every cell of the animation took the
  // same amount of time.  We can make different cells show for different
  // durations, if we're willing to do a little more work:
  let animations = new Map();
  animations.set(AnimationState.IDLE_E, new AnimationSequence(true).to("alien_thrust_r_0.png", 750).to("alien_thrust_r_1.png", 75));

  // Note that I did not draw the Alien.  I used the "Universal Sprite Sheet
  // Creator" at
  // https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/.
  new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 4, width: 1, height: 2 }),
    appearance: new AnimatedSprite({ width: 2, height: 2, animations }),
    role: new Hero(),
    movement: new ManualMovement(),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
