import { Actor, BoxBody, CircleBody, FilledBox, FilledCircle, FilledPolygon, FilledRoundedBox, JetLagGameConfig, PolygonBody, initializeAndLaunch } from "../jetlag";

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
  // A circle.  It is filled red.  It has a green outline.  The body has a
  // bigger radius
  new Actor({
    appearance: new FilledCircle({ radius: .5, fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
  });

  // A rectangle.  It is filled blue.  It has no outline.  The body has a
  // smaller perimeter and different shape
  new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 4, width: 2, height: 2 }),
    appearance: new FilledBox({ width: 1, height: .5, fillColor: "#0000ff" }),
  });

  // A polygon.  The fourth color channel is "alpha", and 00 means
  // "transparent", even though it looks like it should be red.
  new Actor({
    rigidBody: new PolygonBody({ cx: 10, cy: 5, vertices: [0, -.5, .5, 0, 0, .5, -1, 0] }),
    appearance: new FilledPolygon({ vertices: [0, -.5, .5, 0, 0, .5, -1, 0], fillColor: "#ff000000", lineWidth: 4, lineColor: "#00ff00" }),
  });

  // A rounded rectangle is like a regular rectangle, but it gets a radius (in
  // meters) to control the curve of the corners.
  new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 7, width: 3, height: 2 }),
    appearance: new FilledRoundedBox({ width: 3, height: 2, fillColor: "#00ffff", lineWidth: 2, lineColor: "#000000", radius: .25 })
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
