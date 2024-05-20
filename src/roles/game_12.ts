import { Actor, CircleBody, Enemy, Goodie, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9 };
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
  // Restart the level when we win or lose
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Every level will use tilt, and every level will have a box around it
  enableTilt(10, 10);
  boundingBox();

  // By default, heroes have "1" strength, and enemies do "2" damage, so when
  // they collide, the hero goes away
  new Actor({
    appearance: new ImageSprite({ width: 0.4, height: 0.4, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.2 }, { density: 2 }),
    movement: new TiltMovement(),
    role: new Hero({
      onStrengthChange: (h) => {
        if ((h.role as Hero).strength == 4) h.resize(2); else h.resize(.5);
      }
    }),
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
    role: new Enemy(),
  });

  // This goodie changes the hero's strength, which, in turn, triggers the
  // hero's strength change callback
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 12, cy: 8, radius: 0.4 }),
    role: new Goodie({
      onCollect: (_g: Actor, h: Actor) => {
        (h.role as Hero).strength += 3;
        return true;
      }
    }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);

