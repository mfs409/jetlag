import { Actor, CircleBody, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, TextSprite, initializeAndLaunch, stage } from "../jetlag";

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
    imageNames: ["sprites.json"],
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  let hero = new Actor({
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .5 }),
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    movement: new ManualMovement({ rotateByDirection: true }),
  });

  // such a small change... we will just put this actor on the heads-up
  // display instead of in the world.
  new Actor({
    rigidBody: new CircleBody({ cx: .5, cy: .5, radius: .001 }, { scene: stage.hud }),
    appearance: new TextSprite(
      { center: false, face: "Arial", size: 20, color: "#FF0000aa" },
      () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
  });

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).addVelocity(-1, 0))
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).addVelocity(1, 0))
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).addVelocity(0, -1))
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).addVelocity(0, 1))

  // Notice that we did not put any bounds on the camera, so the visible world
  // is going to be "infinite".
  stage.world.camera.setCameraFocus(hero);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
