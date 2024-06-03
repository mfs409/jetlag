import { Actor, BoxBody, FilledRoundedBox, JetLagGameConfig, Path, PathMovement, TextSprite, initializeAndLaunch } from "../jetlag";

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
    rigidBody: new BoxBody({ cx: 8, cy: 4, width: 4, height: 1.5 }),
    appearance: [
      new FilledRoundedBox({ width: 4, height: 1.5, radius: .1, fillColor: "#3258a8", lineColor: "#000000", lineWidth: .03 }),
      new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 20, offset: { dx: 0, dy: -.25 } }, "Are you having fun?"),
      new FilledRoundedBox({ width: 1, height: .5, radius: .1, fillColor: "#00000000", lineColor: "#000000", lineWidth: .03, offset: { dx: -1, dy: .35 } }),
      new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 20, offset: { dx: -1, dy: .35 } }, "Yes"),
      new FilledRoundedBox({ width: 1, height: .5, radius: .1, fillColor: "#00000000", lineColor: "#000000", lineWidth: .03, offset: { dx: 1, dy: .35 } }),
      new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 20, offset: { dx: 1, dy: .35 } }, "No"),
    ],
    movement: new PathMovement(new Path().to(8, 11).to(8, 4), 3, false),
    gestures: {
      tap: (actor: Actor, worldCoords: { x: number, y: number }) => {
        // The prompt could be moving, so we need to figure out its center
        let cx = actor.rigidBody.getCenter().x;
        let cy = actor.rigidBody.getCenter().y;
        let y_t = cy + .35 - .25; // Start with prompt's center, down dy, up half height
        let y_b = y_t + .5;       // From y_t, add full height
        let y_l = cx - 1 - .5;    // Start with prompt's center, left dx, left half width
        let y_r = y_l + 1;        // From y_l, add full width
        let n_t = y_t;            // Same top as the "yes" box
        let n_b = y_b;            // Same bottom as the "yes" box
        let n_l = cx + 1 - .5;    // Start with prompt's center, right dx, left half width
        let n_r = n_l + 1;        // From n_l, add full width

        // If we're in the "yes" box, move away to the left
        if (worldCoords.x >= y_l && worldCoords.x <= y_r && worldCoords.y >= y_t && worldCoords.y <= y_b) {
          (actor.movement as PathMovement).resetPath(new Path().to(cx, cy).to(cx - 10, cy), 3, false);
          return true;
        }

        // if we're in the "no" box, move away to the right
        else if (worldCoords.x >= n_l && worldCoords.x <= n_r && worldCoords.y >= n_t && worldCoords.y <= n_b) {
          (actor.movement as PathMovement).resetPath(new Path().to(cx, cy).to(cx + 10, cy), 3, false);
          return true;
        }
        return false;
      }
    }
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
