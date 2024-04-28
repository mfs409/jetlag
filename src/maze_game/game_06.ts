import { Actor, BoxBody, CircleBody, Destination, FilledBox, Goodie, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, TextSprite, initializeAndLaunch, stage } from "../jetlag";

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
  // Level 6 "Activates" the destination and adds some helpful text

  // Define the maze layout with walls, a hero, a destination, and a goodie
  const mazeLayout = [
    "H#G             ",
    " ####### ##### #",
    " #     # #G#   #",
    " # ### # # # # #",
    " #   #   # # #  ",
    " #G#G# #   #G# #",
    " ##### ## ####  ",
    " #   #   #   ## ",
    "   #   #   #G#D ",
  ];

  stage.backgroundColor = "#b3cde0";

  // Draw four walls, covering the four borders of the world
  new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: -.05, width: 16, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 9.05, width: 16, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16.05, cy: 4.5, width: .1, height: 9 }),
    role: new Obstacle(),
  });

  // Create a hero whose movement we can control "explicitly"
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png", z: 1 }),
    rigidBody: new CircleBody({ cx: .5, cy: .5, radius: 0.4, }),
    role: new Hero(),
    movement: new ManualMovement(),
  });

  // Set up the keyboard for controlling the hero
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (h.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (h.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (h.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (h.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (h.movement as ManualMovement).updateYVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (h.movement as ManualMovement).updateYVelocity(5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (h.movement as ManualMovement).updateXVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (h.movement as ManualMovement).updateXVelocity(5));

  // Create walls and goodies from the `mazeLayout`
  for (let row = 0; row < mazeLayout.length; row++) {
    for (let col = 0; col < mazeLayout[row].length; col++) {
      if (mazeLayout[row][col] === "#") {
        new Actor({
          rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
          appearance: new FilledBox({ width: 1, height: 1, fillColor: "#6497b1" }),
          role: new Obstacle(),
        });
      }
      else if (mazeLayout[row][col] === "G") {
        new Actor({
          appearance: new ImageSprite({ width: .5, height: .5, img: "blue_ball.png" }),
          rigidBody: new CircleBody({ cx: col + 0.5, cy: row + 0.5, radius: 0.25 }),
          role: new Goodie(),
        });
      }
    }
  }

  // Create a destination that requires 6 goodies before it works
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 14.5, cy: 8.5, radius: 0.4 }),
    role: new Destination({ onAttemptArrival: () => { return stage.score.getGoodieCount(0) == 6; } }),
  });
  stage.score.setVictoryDestination(1);

  // Put a message on the screen to help the player along
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", color: "#005b96", size: 20, z: 2 }, () => "You need " + (6 - stage.score.getGoodieCount(0)) + " more Goodies"),
    rigidBody: new BoxBody({ cx: 13.6, cy: 0.05, width: .1, height: .1 }, { scene: stage.hud }),
  });

  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
