import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox } from "./common";

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
  // There will be winning and losing in these chapters, and we'll always want
  // to restart
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  stage.world.setGravity(0, 10);
  boundingBox();

  // make a hero who doesn't start moving until it is touched
  let a = new Actor({
    appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.5, cy: 8.25, radius: 0.375 }, { density: 1, friction: 0, disableRotation: true }),
    role: new Hero(),
  });

  a.gestures.mouseHover = (actor: Actor, worldCoords: { x: number, y: number }) => {
    if (worldCoords.y > actor.rigidBody.getCenter().y)
      (actor.appearance[0] as ImageSprite).setImage("red_ball.png");
    else
      (actor.appearance[0] as ImageSprite).setImage("grey_ball.png");
    return true;
  }
  a.gestures.mouseUnHover = (actor: Actor) => { (actor.appearance[0] as ImageSprite).setImage("green_ball.png"); return true; }
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
