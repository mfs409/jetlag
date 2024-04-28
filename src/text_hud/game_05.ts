import { Actor, BoxBody, JetLagGameConfig, TextSprite, initializeAndLaunch } from "../jetlag";

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
    imageNames: ["sprites.json"],
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // The text moved in a weird way when the count went above 9.  Let's not
  // center?

  let tap_count = 0;
  new Actor({
    rigidBody: new BoxBody({ cx: 1, cy: 1, width: .5, height: .5 }),
    appearance: new TextSprite(
      { center: false, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 },
      () => "Taps: " + tap_count),
    gestures: { tap: () => { tap_count += 1; return true; } }
  });
  // Uh-oh, un-centering doesn't do what we want.  If you want interactive
  // text that isn't centered, you're probably going to want to use two
  // actors, an invisible but interactive one, and a visible but inert one.
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
