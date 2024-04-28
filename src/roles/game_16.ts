import { Actor, BoxBody, CircleBody, Enemy, Goodie, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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
  // Throughout this tutorial, we'll have levels that can be "won" or "lost".
  // In all cases, we'll go right back to the same level.
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Every level will use tilt, and every level will have a box around it
  enableTilt(10, 10);
  boundingBox();

  // We can change how much damage an enemy is capable of doing, and we can
  // require certain heroes to stay alive.  Otherwise, as long as one hero is
  // still alive, the game goes on
  for (let i = 1; i < 4; ++i) {
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new BoxBody({ cx: 2 * i, cy: 3, width: 0.8, height: 0.8 }, { density: 2 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 10 - i, mustSurvive: i == 3 }),
    });
  }

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 12, cy: 8.6, radius: 0.4 }),
    role: new Enemy({
      damage: 8, onDefeatHero: (e: Actor) => e.resize(1.2), onDefeated: (e: Actor) =>
        new Actor({
          appearance: new ImageSprite({ width: .5, height: .5, img: "blue_ball.png" }),
          rigidBody: new CircleBody({ radius: .25, cx: e.rigidBody.getCenter().x, cy: 2 }),
          role: new Goodie()
        })
    }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
