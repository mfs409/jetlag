import { Actor, BoxBody, CircleBody, Destination, FilledBox, FilledCircle, GridSystem, Hero, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, TextSprite, initializeAndLaunch, stage } from "../jetlag";

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
function builder(level: number) {
  // A "side scroller" game

  // Draw a grid on the screen, covering the whole visible area
  GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 32, y: 9 });

  // Based on the values in the GameConfig object, we can expect to have a
  // screen that is a 16:9 ratio.  It will seem that the viewable area is 16
  // meters by 9 meters.  We'll make the "world" twice as wide.  All this
  // really means is that the camera won't show anything outside of the range
  // (0,0):(32,9):
  stage.world.camera.setBounds(0, 0, 32, 9);

  // Draw four walls, covering the four borders of the world
  new Actor({
    appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: .05, width: 32, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: 8.95, width: 32, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: .05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 31.95, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });

  // Make a hero, let the camera follow it, and let tapping cause the hero to
  // jump
  let h = new Actor({
    appearance: new FilledCircle({ radius: .75, fillColor: "#0000ff", lineWidth: .03, lineColor: "#000044" }),
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .75 }),
    role: new Hero(),
    movement: new ManualMovement(),
    gestures: { tap: () => { (h.movement as ManualMovement).updateYVelocity(-8); return true; } },
  });

  // This game will be a platformer/side scroller, so we want gravity
  // downward:
  stage.world.setGravity(0, 9.8);

  // Set up arrow keys to control the hero
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (h.movement as ManualMovement).updateXVelocity(-5); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (h.movement as ManualMovement).updateXVelocity(0); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (h.movement as ManualMovement).updateXVelocity(5); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (h.movement as ManualMovement).updateXVelocity(0); });

  // Let the camera follow the hero
  stage.world.camera.setCameraFocus(h);

  // Make a destination for winning the game
  new Actor({
    appearance: new FilledCircle({ radius: .5, fillColor: "#00ff00", lineWidth: .03, lineColor: "#004400" }),
    rigidBody: new CircleBody({ cx: 31, cy: 6, radius: .5 }),
    role: new Destination(),
    movement: new ManualMovement(),
  });
  stage.score.onWin = { level: level, builder: builder }
  stage.score.setVictoryDestination(1);

  // Set up a timer for losing
  stage.score.onLose = { level: level, builder: builder }
  stage.score.setLoseCountdownRemaining(10);

  // Draw a box, and write a timer on it.  Both go on the HUD
  new Actor({
    appearance: new FilledBox({ width: .75, height: .75, fillColor: "#eeeeee", lineWidth: .03, lineColor: "#000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: .75, width: .75, height: .75 }, { scene: stage.hud }),
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", color: "#444444", size: 48 },
      () => (stage.score.getLoseCountdownRemaining() ?? 0).toFixed(0)),
    rigidBody: new BoxBody({ cx: 8, cy: .75, width: 1.8, height: 1 }, { scene: stage.hud }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
