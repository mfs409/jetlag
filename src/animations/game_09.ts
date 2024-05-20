import { Actor, AnimatedSprite, AnimationSequence, AnimationState, CircleBody, JetLagGameConfig, initializeAndLaunch } from "../jetlag";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true;
  // Here's where we name all the images/sounds/background music files.
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
  // The default animation is called "IDLE_E", representing when something
  // faces rightward/eastward.  You must provide it.  So in this case, we'll
  // make an animation based on 8 coin images, they'll show for the same
  // amount of time each:
  let coins = AnimationSequence.makeSimple({
    timePerFrame: 100,
    repeat: true,
    images: ["coin0.png", "coin1.png", "coin2.png", "coin3.png", "coin4.png", "coin5.png", "coin6.png", "coin7.png"]
  });
  let animation_map = new Map();
  animation_map.set(AnimationState.IDLE_E, coins);

  // Now we can use it
  for (let i = 0; i < 16; ++i) {
    let coin = new Actor({
      appearance: new AnimatedSprite({ width: .5, height: .5, animations: animation_map }),
      rigidBody: new CircleBody({ cx: i + .5, cy: 2, radius: .25 }),
    });
    (coin.appearance[0] as AnimatedSprite).skipTo(Math.trunc(i / 2), (i % 2) * 50);
  }
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
