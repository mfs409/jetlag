import { FilledBox, ZIndex } from "../Components/Appearance";
import { BoxBody } from "../Components/RigidBody";
import { Actor } from "../Entities/Actor";
import { Scene } from "../Entities/Scene";

/**
 * GridSystem is a lightweight system for drawing grids on the screen.  Grids
 * can be helpful during the initial steps of developing a game.
 *
 * In reality, this isn't useful enough to be an official part of JetLag, but it
 * is convenient for the tutorials, so we're keeping it.
 */
export class GridSystem {
  /**
   * Draw a grid with meter and (optionally) half-meter lines
   *
   * @param scene         The scene where the grid should be drawn
   * @param top_left      The x/y coordinates of the top-left corner
   * @param bottom_right  The x/y coordinates of the bottom-right corner
   * @param z             The Z index of the grid
   */
  public static makeGrid(scene: Scene, top_left: { x: number, y: number }, bottom_right: { x: number, y: number }, z?: ZIndex) {
    let width = bottom_right.x - top_left.x;
    let height = bottom_right.y - top_left.y;
    z = z ?? -2;

    for (let x = top_left.x + .5; x <= bottom_right.x + 1; x += 2) {
      new Actor({
        rigidBody: new BoxBody({ cx: x, cy: top_left.y + height / 2, width: 1, height }, { scene }),
        appearance: new FilledBox({ width: 1, height, lineWidth: .02, lineColor: "#000000", fillColor: "#00000000", z })
      });
    }

    for (let y = top_left.y + .5; y <= bottom_right.y + 1; y += 2) {
      new Actor({
        rigidBody: new BoxBody({ cx: top_left.x + width / 2, cy: y, width, height: 1 }, { scene }),
        appearance: new FilledBox({ width: width, height: 1, lineWidth: .02, lineColor: "#000000", fillColor: "#00000000", z })
      });
    }
  }
}
