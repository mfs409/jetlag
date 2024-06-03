import { Actor, AlphaFilter, BoxBody, CircleBody, Destination, FilledBox, Hero, ImageSprite, JetLagGameConfig, Scene, SpriteLocation, TextSprite, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";
import { FadeOutFilterComponent } from "./filters";

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
    imageNames: ["sprites.json", "noise.png", "radial.png"]
  };
}

/**
 * Set up the level
 *
 * @param level The level to show
 */
function levelBuilder(_level: number) {
  // Turn on Tilt
  enableTilt(10, 10);
  boundingBox();
  stage.score.setVictoryDestination(1);
  stage.score.onLose = { level: 1, builder: levelBuilder };
  stage.score.onWin = { level: 1, builder: levelBuilder };

  // Make a pause button
  new Actor({
    appearance: new ImageSprite({ img: "pause.png", width: 1, height: 1 }),
    rigidBody: new BoxBody({ cx: .5, cy: 1.5, width: 1, height: 1 }, { scene: stage.hud }),
    gestures: { tap: () => { pauseGame(); return true; } }
  });

  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  new Actor({
    appearance: new ImageSprite({ width: 16, height: 9, img: "noise.png", z: -2 }),
    rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: 0.01 }),
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
    role: new Destination(),
  });

  let light = new Actor({
    appearance: new ImageSprite({ width: 64, height: 36, img: "radial.png", z: 2 }),
    rigidBody: new BoxBody({ width: .001, height: .001, cx: 8, cy: 4.5 })
  });
  (light.appearance[0] as ImageSprite).image.sprite.filters = [new AlphaFilter(.8)];
  // TODO: see https://pixijs.com/8.x/examples/masks/filter
  stage.world.repeatEvents.push(() => {
    let hc = hero.rigidBody.getCenter();
    light.rigidBody.setCenter(hc.x, hc.y);
  });
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
    screenshot!.z = -2;
    new Actor({ appearance: screenshot!, rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }), });

    let f = new FadeOutFilterComponent();
    stage.renderer.addZFilter(f, -2, SpriteLocation.OVERLAY);

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
  }, true);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), levelBuilder);
