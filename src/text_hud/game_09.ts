import { Actor, CircleBody, FilledRoundedBox, JetLagGameConfig, Path, PathMovement, TextSprite, initializeAndLaunch } from "../jetlag";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true;
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  new Actor({
    appearance: [new FilledRoundedBox({ width: 1.5, height: .75, radius: .1, fillColor: "#3258a8", lineColor: "#000000", lineWidth: .03 }),
    new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 20 }, "Hello")],
    rigidBody: new CircleBody({ cx: 2, cy: 2, radius: .01 }),
    movement: new PathMovement(new Path().to(2, 2).to(14, 2).to(14, 7).to(2, 7).to(2, 2), 1, true)
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
