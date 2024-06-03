import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, ManualMovement, Obstacle, Scene, Sensor, SpriteLocation, TextSprite, initializeAndLaunch, stage } from "../jetlag";
import { BlurFilterComponent, FadeInFilterComponent, FadeOutFilterComponent, GrayscaleFilterComponent, HSLSandFilterComponent, SepiaTvFilterComponent } from "./filters";

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
    imageNames: ["sprites.json", "mid.png", "back.png"]
  };
}

/**
 * Set up the level
 *
 * @param level The level to show
 */
function levelBuilder(_level: number) {
  // Draw a floor
  stage.world.camera.setBounds(0, 0, undefined, 9);

  // set up the background
  stage.backgroundColor = "#17b4ff";
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5, }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "back.png" }), speed: 1 });
  stage.background.addLayer({ anchor: { cx: 0, cy: 4.5, }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 });

  let h = new Actor({
    appearance: new ImageSprite({ width: 2, height: 2, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.5, cy: 5.9, radius: 1 }, { disableRotation: true }),
    movement: new ManualMovement(),
    role: new Hero()
  });
  (h.movement as ManualMovement).updateXVelocity(10);

  // center the camera a little ahead of the hero, so we can see more of the
  // world during gameplay
  stage.world.camera.setCameraFocus(h, 6, 0);

  // Put a distance display on the HUD
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 40, color: "#FFFFFF", strokeColor: "#000000", strokeWidth: 1 }, () => h.rigidBody.getCenter().x.toFixed(2) + " m"),
    rigidBody: new CircleBody({ cx: .1, cy: .1, radius: .05 }, { scene: stage.hud })
  })

  // Draw some floor
  let floor0 = new Actor({
    appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -32, cy: 9.05, width: 64, height: .1 }),
    role: new Obstacle(),
  });
  let floor1 = new Actor({
    appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 32, cy: 9.05, width: 64, height: .1 }),
    role: new Obstacle(),
  });
  let floor2 = new Actor({
    appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 96, cy: 9.05, width: 64, height: .1 }),
    role: new Obstacle(),
  });

  // This sensor will keep "building" the next part of the level as the hero
  // moves forward
  new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ width: .1, height: 9, cx: 63.95, cy: 4.5 }),
    role: new Sensor({
      heroCollision: (s: Actor, _h: Actor) => {
        // First, rotate the floor names, move the backmost to the front
        let tmp = floor0;
        floor0 = floor1;
        floor1 = floor2;
        floor2 = tmp;
        floor2.rigidBody.setCenter(floor2.rigidBody.getCenter().x + 192, floor2.rigidBody.getCenter().y);
        // Finally, move the sensor
        s.rigidBody.setCenter(s.rigidBody.getCenter().x + 64, s.rigidBody.getCenter().y);
      }
    }),
  });


  // Every level is won when a hero reaches the destination
  stage.score.setVictoryDestination(1);

  // Make a pause button
  new Actor({
    appearance: new ImageSprite({ img: "pause.png", width: 1, height: 1 }),
    rigidBody: new BoxBody({ cx: .5, cy: 1.5, width: 1, height: 1 }, { scene: stage.hud }),
    gestures: { tap: () => { pauseGame(); return true; } }
  });

  stage.score.onLose = { level: 1, builder: levelBuilder };
  stage.score.onWin = { level: 1, builder: levelBuilder };

  // stage.renderer.addFilter(new BlurFilterComponent(), SpriteLocation.HUD);
  // stage.renderer.addFilter(new GrayscaleFilterComponent(), SpriteLocation.WORLD);
  // stage.renderer.addZFilter(new HSLSandFilterComponent(), 0, SpriteLocation.WORLD);
  // stage.renderer.addFilterToMain(new SepiaTvFilterComponent());
  // stage.renderer.addFilterToMain(new FadeInFilterComponent());
}

/**
 * Create an overlay (blocking all game progress) consisting of a text box over
 * a snapshot of the in-progress game.  Clearing the overlay will resume the
 * current level.
 */
function pauseGame() {
  // Immediately install the overlay, to pause the game
  stage.requestOverlay((overlay: Scene, screenshot: ImageSprite | undefined) => {
    // Draw the screenshot
    (screenshot as ImageSprite).z = -2;
    new Actor({ appearance: screenshot!, rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }), });

    // It's always good to have a way to go back to the chooser:
    new Actor({
      appearance: new ImageSprite({ img: "back_arrow.png", width: 1, height: 1 }),
      rigidBody: new BoxBody({ cx: 15.5, cy: .5, width: 1, height: 1 }, { scene: overlay }),
      gestures: { tap: () => { stage.clearOverlay(); stage.switchTo(levelBuilder, 1); return true; } }
    });

    // Pressing anywhere on the text box will make the overlay go away
    new Actor({
      appearance: [
        new FilledBox({ width: 2, height: 1, fillColor: "#000000" }),
        new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 28, z: 0 }, "Paused"),
      ],
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 2, height: 1 }, { scene: overlay }),
      gestures: { tap: () => { stage.clearOverlay(); return true; } },
    });

    // stage.renderer.addZFilter(new FadeOutFilterComponent(), -2, SpriteLocation.OVERLAY);
  }, true);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), levelBuilder);
