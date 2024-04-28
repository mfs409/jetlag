import { Actor, CircleBody, Enemy, Goodie, Hero, ImageSprite, JetLagGameConfig, TextSprite, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // JetLag also supports invincibility.  In this level, the goodie makes the
  // hero invincible for 15 seconds.  Some enemies can't be defeated with
  // invincibility.

  // defeat 3 enemies to win
  stage.score.setVictoryEnemyCount(3);

  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }, { density: 2 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // draw a few enemies, and make them rotate
  for (let i = 0; i < 5; ++i) {
    let cfg = { cx: i + 4, cy: 6, radius: 0.25, width: 0.5, height: 0.5, img: "red_ball.png" };
    new Actor({
      appearance: new ImageSprite(cfg),
      rigidBody: new CircleBody(cfg, { density: 1.0, elasticity: 0.3, friction: 0.6, rotationSpeed: 1 }),
      role: new Enemy({ immuneToInvincibility: i == 4, instantDefeat: i == 2, disableHeroCollision: true }),
    });
  }

  // this goodie adds 15 seconds of invincibility
  new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.25, }, { rotationSpeed: .25 }),
    role: new Goodie({
      onCollect: (_g: Actor, h: Actor) => {
        (h.role as Hero).invincibleRemaining = ((h.role as Hero).invincibleRemaining + 15); return true;
      }
    }),
  });

  // Show how much invincibility is remaining
  new Actor({
    appearance: new TextSprite({ face: "Arial", size: 16, color: "#3C64BF", center: false }, () => (hero.role as Hero).invincibleRemaining.toFixed(0) + " Invincibility"),
    rigidBody: new CircleBody({ radius: .01, cx: .01, cy: 1 }, { scene: stage.hud })
  })
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
