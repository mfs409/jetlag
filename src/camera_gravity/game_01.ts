import { Actor, CircleBody, Enemy, FilledCircle, FilledPolygon, GridSystem, Hero, JetLagGameConfig, KeyCodes, ManualMovement, Path, PathMovement, PolygonBody, Projectile, ProjectileMovement, TimedEvent, initializeAndLaunch, stage } from "../jetlag";

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
  // A "clocked" game: turn and shoot

  // Draw a grid on the screen, covering the whole visible area
  GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 16, y: 9 });

  // Make a hero
  let h = new Actor({
    appearance: new FilledPolygon({ vertices: [0, -.5, .25, .5, -.25, .5], fillColor: "#0000ff", lineWidth: .03, lineColor: "#000044", z: 1 }),
    rigidBody: new PolygonBody({ cx: 8, cy: 4.5, vertices: [0, -.5, .25, .5, -.25, .5] }, { collisionsEnabled: false }),
    role: new Hero(),
    movement: new ManualMovement(),
  });

  // Set up arrow keys to control the hero
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { h.rigidBody.body.SetAngularVelocity(-6); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { h.rigidBody.body.SetAngularVelocity(0); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { h.rigidBody.body.SetAngularVelocity(6); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { h.rigidBody.body.SetAngularVelocity(0); });

  // Toss a projectile!
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
    let dx = Math.cos(h.rigidBody.getRotation() - Math.PI / 2);
    let dy = Math.sin(h.rigidBody.getRotation() - Math.PI / 2);
    let x = h.rigidBody.getCenter().x;
    let y = h.rigidBody.getCenter().y;
    let scale = 8;
    let rigidBody = new CircleBody({ radius: 0.125, cx: -100, cy: -100 });
    rigidBody.setCollisionsEnabled(true);
    let appearance = new FilledCircle({ radius: .125, fillColor: "#bbbbbb", z: 0 });
    let role = new Projectile();
    new Actor({ appearance, rigidBody, movement: new ProjectileMovement(), role });
    role.tossAt(x, y, x + scale * dx, y + scale * dy, h, 0, 0);
  });

  // Raining enemies
  stage.world.timer.addEvent(new TimedEvent(2, true, () => {
    let angle = Math.random() * 2 * Math.PI;
    let hx = h.rigidBody.getCenter().x, hy = h.rigidBody.getCenter().y;
    let sx = 9 * Math.sin(angle) + hx, sy = 9 * Math.cos(angle) + hy;
    new Actor({
      appearance: new FilledCircle({ radius: .5, fillColor: "#F01100" }),
      rigidBody: new CircleBody({ cx: sx, cy: sy, radius: .5 }),
      role: new Enemy({ damage: 1 }),
      movement: new PathMovement(new Path().to(sx, sy).to(hx, hy), 3, false),
    });
  }));

  stage.score.onWin = { level: level, builder: builder }
  stage.score.onLose = { level: level, builder: builder }
  stage.score.setVictoryEnemyCount(10);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
