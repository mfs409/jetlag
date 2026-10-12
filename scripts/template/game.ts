import { Actor, BoxBody, CircleBody, DebugToggle, DynamicBodyMovement, FilledBox, FilledCircle, FilledPolygon, GridSystem, PlayerControlBehavior, JetLagGameConfig, KeyCodes, SolidBehavior, PolygonBody, initializeAndLaunch, stage } from "../jetlag";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for a game in landscape mode, and 9/16 for a game in portrait mode
  aspectRatio = { width: 16, height: 9 };
  // Make this `false` when you're done debugging your game and are ready to
  // share it with the world.
  hitBoxes = true;
}

/**
 * This function draws the first scene that shows when the game starts.  In this
 * code, it's an interactive world that cannot be won or lost.  After your game
 * starts becoming more polished, you will probably want to use several
 * functions like this one as a way to organize the parts of your game (levels,
 * chooser, welcome screen, store, etc).
 */
function builder() {
  // Draw a grid on the screen, to help us think about the positions of actors.
  // Remember that when `hitBoxes` is true, clicking the screen will show
  // coordinates in the developer console.
  GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 16, y: 9 });

  // Enable the 'b' key to turn on/off hitBoxes at any time.  This line should
  // be removed before releasing a game, but it's helpful during development.
  DebugToggle.enable();

  // Make a "hero" who moves via keyboard control and appears as a circle
  let hero = new Actor({
    appearance: new FilledCircle({ radius: .5, fillColor: "#ff0000", lineWidth: .04, lineColor: "#00ff00" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: .5 }),
    movement: new DynamicBodyMovement(),
    behaviors: new PlayerControlBehavior(),
  });

  // Make an obstacle that is a rectangle
  new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 4, width: 1, height: 1 }),
    appearance: new FilledBox({ width: 1, height: 1, fillColor: "#ff0000", lineWidth: .04, lineColor: "#00ff00" }),
    behaviors: new SolidBehavior(),
  });

  // Make an obstacle that is a polygon
  new Actor({
    rigidBody: new PolygonBody({ cx: 10, cy: 5, vertices: [{ x: 0, y: -.5 }, { x: .5, y: 0 }, { x: 0, y: .5 }, { x: -1, y: 0 }] }),
    appearance: new FilledPolygon({ vertices: [{ x: 0, y: -.5 }, { x: .5, y: 0 }, { x: 0, y: .5 }, { x: -1, y: 0 }], fillColor: "#ff0000", lineWidth: .04, lineColor: "#00ff00" }),
    behaviors: new SolidBehavior(),
  });

  // Pressing an arrow or WASD key will change the hero's velocity
  stage.keyboard.setKeyUpHandler([KeyCodes.KEY_UP, KeyCodes.KEY_W], () => hero.rigidBody.yVelocity = 0);
  stage.keyboard.setKeyUpHandler([KeyCodes.KEY_DOWN, KeyCodes.KEY_S], () => hero.rigidBody.yVelocity = 0);
  stage.keyboard.setKeyUpHandler([KeyCodes.KEY_LEFT, KeyCodes.KEY_A], () => hero.rigidBody.xVelocity = 0);
  stage.keyboard.setKeyUpHandler([KeyCodes.KEY_RIGHT, KeyCodes.KEY_D], () => hero.rigidBody.xVelocity = 0);
  stage.keyboard.setKeyDownHandler([KeyCodes.KEY_UP, KeyCodes.KEY_W], () => hero.rigidBody.yVelocity = -5);
  stage.keyboard.setKeyDownHandler([KeyCodes.KEY_DOWN, KeyCodes.KEY_S], () => hero.rigidBody.yVelocity = 5);
  stage.keyboard.setKeyDownHandler([KeyCodes.KEY_LEFT, KeyCodes.KEY_A], () => hero.rigidBody.xVelocity = -5);
  stage.keyboard.setKeyDownHandler([KeyCodes.KEY_RIGHT, KeyCodes.KEY_D], () => hero.rigidBody.xVelocity = 5);
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
