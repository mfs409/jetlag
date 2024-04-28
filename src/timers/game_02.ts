import { Actor, CircleBody, Enemy, Goodie, Hero, ImageSprite, JetLagGameConfig, TextSprite, TiltMovement, TimedEvent, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

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
  // There are two kinds of timers in this level.  One is attached to enemies,
  // and makes them reproduce every second.  The other says that if you can
  // stay alive for 5 seconds, you win.
  stage.world.setGravity(0, 0);
  enableTilt(10, 10);
  boundingBox();

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // make an enemy, put it into a vector of enemies
  let e = new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 14, cy: 7, radius: 0.25 }),
    movement: new TiltMovement(),
    role: new Enemy(),
    extra: { num: 6 } // We'll use this to count down so we don't make too many enemies
  });

  // We can use this array to store all of the enemies in the level
  let enemies: Actor[] = [];
  enemies.push(e);

  // set a timer callback on the level, to repeatedly spawn new enemies.
  // warning: "6" is going to lead to lots of enemies eventually, and there's
  // no way to defeat them in this level!
  //
  // Note: the timer repeats over and over, but at some point, our code will
  // just not do anything in response to it :)
  stage.world.timer.addEvent(new TimedEvent(2, true, () => {
    // We will need to keep track of all the enemies we make, and then add them to
    // our list of enemies just before this function returns
    //
    // Note: it's a bad idea to make an array on every timer call, but for this
    // demo, it's OK
    let newEnemies: Actor[] = [];

    // For each enemy we've made, if it has remaining reproductions, then make
    // another enemy
    for (let e of enemies) {
      // If this enemy has remaining reproductions
      if (e.extra.num > 0) {
        // decrease remaining reproductions
        e.extra.num -= 1;

        // reproduce the enemy
        let e2 = new Actor({
          appearance: new ImageSprite({ width: .5, height: .5, img: "red_ball.png" }),
          rigidBody: new CircleBody({ cx: e.rigidBody.getCenter().x + 0.01, cy: e.rigidBody.getCenter().y + 0.01, radius: .25 }),
          movement: new TiltMovement(),
          role: new Enemy(),
          extra: { num: e.extra.num }
        });
        newEnemies.push(e2);
      }
    }
    // Add the new enemies to the main list
    let tmp = enemies.concat(newEnemies);
    enemies = tmp;
  }));

  // Specify default win and lose behaviors
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Next, let's say that if you survive for 10 seconds, you win:
  stage.score.setVictorySurvive(10);

  // Finally, if you get this goodie, you save 2 seconds
  new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 1, cy: 1, radius: 0.25 }),
    role: new Goodie({ onCollect: () => { stage.score.setWinCountdownRemaining(stage.score.getWinCountdownRemaining()! - 2); return true; } }),
  });

  new Actor({
    appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => (stage.score.getWinCountdownRemaining()!.toFixed(2))),
    rigidBody: new CircleBody({ cx: 0.5, cy: 0.2, radius: 0.01 }, { scene: stage.hud })
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
