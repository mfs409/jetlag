import { Actor, CircleBody, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Path, PathMovement, TextSprite, initializeAndLaunch, stage } from "../jetlag";

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
  // This is probably going to look bad, but let's notice that we can make
  // *anything* on the HUD.  We probably don't want heroes or enemies or other
  // such roles, but certainly we can have different kinds of appearance, and
  // they can even have movement.

  let hero = new Actor({
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .5 }),
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    movement: new ManualMovement({ rotateByDirection: true }),
  });

  new Actor({
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .5 }, { scene: stage.hud }),
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    movement: new PathMovement(new Path().to(1, 1).to(15, 1).to(15, 8).to(1, 8).to(1, 1), 4, true)
  });

  // For reference, here's the "Arial" font that we had been using so far
  new Actor({
    rigidBody: new CircleBody({ cx: .5, cy: .5, radius: .001 }, { scene: stage.hud }),
    appearance: new TextSprite(
      { center: false, face: "Arial", size: 20, color: "#FF0000aa" },
      () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
  });

  // You can add fonts to your game by linking to them in your html file.  In
  // this case, I've added a link for the "Lato" font:
  new Actor({
    rigidBody: new CircleBody({ cx: .5, cy: 1.5, radius: .001 }, { scene: stage.hud }),
    appearance: new TextSprite(
      { center: false, face: "Lato", size: 20, color: "#FF0000aa" },
      () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
  });

  // You can also add fonts by *downloading* them into your assets folder, and
  // then linking them differently in your html file.  I did that for the
  // Roboto font
  new Actor({
    rigidBody: new CircleBody({ cx: .5, cy: 1, radius: .001 }, { scene: stage.hud }),
    appearance: new TextSprite(
      { center: false, face: "Roboto", size: 20, color: "#FF0000aa" },
      () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
  });

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).addVelocity(-1, 0))
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).addVelocity(1, 0))
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).addVelocity(0, -1))
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).addVelocity(0, 1))

  stage.world.camera.setCameraFocus(hero);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
