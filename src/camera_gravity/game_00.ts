import { Actor, BoxBody, CircleBody, FilledBox, FilledCircle, FilledPolygon, GridSystem, Hero, JetLagGameConfig, KeyCodes, Obstacle, PolygonBody, TiltMovement, initializeAndLaunch, stage } from "../jetlag";

/** Screen dimensions and other game configuration */
class Config implements JetLagGameConfig {
  // Use {16, 9} for landscape mode, and {9, 16} for portrait mode.
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true; // Set to `false` when everything is done
}

/**
 * This function draws the first scene that shows when the game starts.  In this
 * code, it's an interactive world that cannot be won or lost.  After your game
 * starts becoming more polished, you will probably want to use several
 * functions like this one as a way to organize the parts of your game (levels,
 * chooser, welcome screen, store, etc).
 *
 * @param level Which level of the game should be displayed
 */
function builder(_level: number) {
  // Draw a grid on the screen, to help us think about the positions of actors.
  // Remember that when `hitBoxes` is true, clicking the screen will show
  // coordinates in the developer console.
  GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 16, y: 9 });

  // Make a "hero" who moves via keyboard control and appears as a circle
  let hero = new Actor({
    appearance: new FilledCircle({ radius: .5, fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: .5 }),
    role: new Hero(),
    movement: new TiltMovement(),
  });

  // Make an obstacle that is a rectangle
  new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 4, width: 1, height: 1 }),
    appearance: new FilledBox({ width: 1, height: 1, fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
    role: new Obstacle(),
  });

  // Make an obstacle that is a polygon
  new Actor({
    rigidBody: new PolygonBody({ cx: 10, cy: 5, vertices: [0, -.5, .5, 0, 0, .5, -1, 0] }),
    appearance: new FilledPolygon({ vertices: [0, -.5, .5, 0, 0, .5, -1, 0], fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
    role: new Obstacle(),
  });

  // Pressing a key will induce a force, releasing will stop inducing that force
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = 0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = -5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));

  // Configure tilt: arrow keys will simulate gravitational force, with a
  // maximum of +- 10 in the X and Y dimensions.
  stage.tilt.tiltMax.Set(10, 10);
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
