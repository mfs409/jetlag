import { Actor, AnimatedSprite, AnimationSequence, AnimationState, BoxBody, CircleBody, Destination, Enemy, FilledBox, Goodie, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, Path, PathMovement, Scene, TextSprite, initializeAndLaunch, stage } from "../jetlag";

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
    imageNames: ["sprites.json", "pirate.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // Define the maze layout with walls, a hero, a destination, and a goodie.
  // This time, we'll make bigger exterior borders, so that we don't need
  // special code for the borders' conflict detection
  const mazeLayout = [
    "##################",
    "# #G             #",
    "# ####### ##### ##",
    "# #     # #G#   ##",
    "# # ### # # # # ##",
    "# #   #   # # #  #",
    "# #G#G# #   #G# ##",
    "# ##### ## ####  #",
    "# #   #   #   ## #",
    "#   #   #   #G#D #",
    "##################",
  ];

  stage.backgroundColor = "#b3cde0";

  // Create a hero whose movement we can control "explicitly"
  let animations = new Map();
  let l_ani = AnimationSequence.makeSimple({ timePerFrame: 100, repeat: false, images: ["pirate_walk_l_0.png", "pirate_walk_l_3.png", "pirate_walk_l_6.png"] });
  let r_ani = AnimationSequence.makeSimple({ timePerFrame: 100, repeat: false, images: ["pirate_walk_r_0.png", "pirate_walk_r_3.png", "pirate_walk_r_6.png"] });
  let u_ani = AnimationSequence.makeSimple({ timePerFrame: 100, repeat: false, images: ["pirate_walk_u_0.png", "pirate_walk_u_3.png", "pirate_walk_u_6.png"] });
  let d_ani = AnimationSequence.makeSimple({ timePerFrame: 100, repeat: false, images: ["pirate_walk_d_0.png", "pirate_walk_d_3.png", "pirate_walk_d_6.png"] });
  animations.set(AnimationState.IDLE_E, d_ani)
  let h = new Actor({
    appearance: new AnimatedSprite({ width: 0.8, height: 0.8, z: 1, animations }),
    rigidBody: new CircleBody({ cx: .5, cy: .5, radius: .3, }),
    role: new Hero(),
    movement: new ManualMovement(),
  });

  // Set up the keyboard for controlling the hero
  let tryMove = (a: Actor, dx: number, dy: number) => {
    let cx = a.rigidBody.getCenter().x, cy = a.rigidBody.getCenter().y;
    for (let c of stage.world.physics.actorsAt({ x: cx + dx, y: cy + dy, })) {
      if (c.role instanceof Obstacle)
        return;
      a.role.onCollide(c);
    }
    if (dx == -1)
      (a.appearance[0] as AnimatedSprite).animations.set(AnimationState.IDLE_E, l_ani);
    else if (dx == 1)
      (a.appearance[0] as AnimatedSprite).animations.set(AnimationState.IDLE_E, r_ani);
    if (dy == -1)
      (a.appearance[0] as AnimatedSprite).animations.set(AnimationState.IDLE_E, u_ani);
    if (dy == 1)
      (a.appearance[0] as AnimatedSprite).animations.set(AnimationState.IDLE_E, d_ani);
    (a.appearance[0] as AnimatedSprite).restartCurrentAnimation();
    a.rigidBody.setCenter(cx + dx, cy + dy);
  }

  // Oh no,the collisions are all broken
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => tryMove(h, 0, -1));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => tryMove(h, 0, 1));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => tryMove(h, -1, 0));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => tryMove(h, 1, 0));

  // Create walls and goodies from the `mazeLayout`
  for (let row = 0; row < mazeLayout.length; row++) {
    for (let col = 0; col < mazeLayout[row].length; col++) {
      if (mazeLayout[row][col] === "#") {
        new Actor({
          rigidBody: new BoxBody({ cx: col - 0.5, cy: row - 0.5, width: 1, height: 1 }),
          appearance: new FilledBox({ width: 1, height: 1, fillColor: "#6497b1" }),
          role: new Obstacle(),
        });
      }
      else if (mazeLayout[row][col] === "G") {
        new Actor({
          appearance: new ImageSprite({ width: .5, height: .5, img: "blue_ball.png" }),
          rigidBody: new CircleBody({ cx: col - 0.5, cy: row - 0.5, radius: 0.25 }),
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

  // Add an enemy
  new Actor({
    appearance: new ImageSprite({ width: .8, height: .8, img: "red_ball.png" }),
    rigidBody: new CircleBody({ radius: .4, cx: 8.5, cy: .5 }),
    role: new Enemy(),
    movement: new PathMovement(new Path().to(8.5, .5).to(8.5, 5.5).to(10.5, 5.5).to(10.5, 2.5).to(10.5, 5.5).to(8.5, 5.5).to(8.5, .5), 3, true)
  });

  // When the level is won, put some white text on a black background.
  // Clicking restarts the level.
  stage.score.winSceneBuilder = (overlay: Scene) => {
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
      gestures: {
        tap: () => {
          stage.clearOverlay();
          stage.switchTo(stage.score.onWin.builder, stage.score.onWin.level);
          return true;
        }
      }
    });
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: " #FFFFFF", size: 28 }, "You Won!"),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay })
    });
  };

  // When the level is lost, put some white text on a black background.
  // Clicking restarts the level.
  stage.score.loseSceneBuilder = (overlay: Scene) => {
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
      gestures: {
        tap: () => {
          stage.clearOverlay();
          stage.switchTo(stage.score.onLose.builder, stage.score.onLose.level);
          return true;
        }
      }
    });
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: " #FFFFFF", size: 28 }, "Try Again..."),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay })
    });
  };

  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
