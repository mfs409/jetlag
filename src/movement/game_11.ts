import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox } from "./common";

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
function builder(_level: number) {
  // Since we can attach ManualMovement to any actor, let's put it all
  // together by making a block breaking game!
  boundingBox();

  // make a hero who is always moving... note there is no friction,
  // anywhere, and the hero is elastic... it won't ever stop...
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 8, cy: 7, radius: 0.25 }, { elasticity: 1, friction: 0.1 }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  (h.movement as ManualMovement).addVelocity(0, 8);

  // make an obstacle and then connect it to some controls
  let boxCfg = { cx: 8, cy: 8.75, width: 2, height: 0.5, fillColor: "#FF0000" };
  let o = new Actor({
    appearance: new FilledBox(boxCfg),
    rigidBody: new BoxBody(boxCfg, { density: 10, elasticity: 1, friction: 0.1 }),
    movement: new ManualMovement(),
    role: new Obstacle(),
  });

  let colors = ["#FF0000", "#FFFF00", "#FF00FF", "#00FF00", "#00FFFF", "#0000FF"];
  for (let r = .25; r < 4.25; r += .5) {
    for (let c = .5; c < 16; c += 1) {
      new Actor({
        appearance: new FilledBox({ width: 1, height: .5, fillColor: colors[Math.trunc(Math.random() * 6)] }),
        rigidBody: new BoxBody({ cx: c, cy: r, width: 1, height: .5 }, { density: 1 }),
        role: new Obstacle({ heroCollision: (thisActor: Actor) => thisActor.enabled = false })
      });
    }
  }

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((o.movement as ManualMovement).updateXVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((o.movement as ManualMovement).updateXVelocity(5)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => ((o.movement as ManualMovement).updateXVelocity(0)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => ((o.movement as ManualMovement).updateXVelocity(0)));

  // This is far from perfect... in particular, it's possible in our current
  // physics configuration to get the ball to move left-right in an infinite
  // cycle.  We'd probably want heroCollisions on the walls, to correct for
  // bad velocities.  But still, it's a nice start!
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
