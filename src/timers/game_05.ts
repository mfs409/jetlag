import { Actor, CircleBody, Enemy, GravityMovement, ImageSprite, JetLagGameConfig, TextSprite, TimedEvent, initializeAndLaunch, stage } from "../jetlag";

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
    imageNames: ["sprites.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // Lastly, notice that you can make a timer "speed up" by having it go *very
  // fast* and then making it seem to to run so often.  Part of the trick is
  // that we know that it will never run faster than 1/45 of a second.
  stage.score.setVictoryEnemyCount(20);
  stage.world.setGravity(0, 3);

  let counter = 0;
  stage.world.timer.addEvent(new TimedEvent(.5, true, () => {
    let phase = Math.max(1, 10 - stage.score.getEnemiesDefeated()!);
    counter = (counter + 1) % phase;
    if (counter != 0) return;
    let e = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: .5 + 15 * Math.random(), cy: -5.5 + 5 * Math.random(), radius: .5 }),
      role: new Enemy(),
      movement: new GravityMovement(),
      gestures: { tap: () => { (e.role as Enemy).defeat(true); return true; } }
    })
  }));

  new Actor({
    appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => stage.score.getEnemiesDefeated() + ""),
    rigidBody: new CircleBody({ cx: 0.5, cy: 0.2, radius: 0.01 }, { scene: stage.hud })
  });

  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
