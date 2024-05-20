import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, ManualMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // This level shows that we can set a button's action to happen repeatedly
  // for as long as it is being depressed, by making use of the touch-down and
  // touch-up gestures.
  boundingBox();

  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: .4, cy: .4, radius: 0.4 }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  // If we just gave it a velocity once, it would slow down...
  (h.movement as ManualMovement).setDamping(5);

  // There is some complexity to how this works, because each button needs to
  // know if it is active.  We could do that via "extra" on each button, but
  // instead we'll use the idea of "capturing" the `active` variable in each
  // call to this function.
  function addToggleButton(actor: Actor, whileDownAction: () => void, onUpAction: (coords: { x: number; y: number }) => void) {
    let active = false; // will be captured by lambdas below
    let touchDown = () => { active = true; return true; };
    let touchUp = (_actor: Actor, hudCoords: { x: number; y: number }) => {
      if (!active) return false;
      active = false;
      onUpAction(hudCoords);
      return true;
    };
    // Put the control and events in the appropriate lists
    stage.world.repeatEvents.push(() => { if (active && whileDownAction) whileDownAction(); });
    actor.gestures.touchDown = touchDown;
    actor.gestures.touchUp = touchUp;
  }

  // draw some buttons for moving the hero.  These are "toggle" buttons: they
  // run some code when they are pressed, and other code when they are
  // released.
  let l = new Actor({
    appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 1, cy: 4.5, width: 2, height: 5 }, { scene: stage.hud }),
  });
  addToggleButton(l, () => (h.movement as ManualMovement).updateXVelocity(-5), () => { });
  let r = new Actor({
    appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 15, cy: 4.5, width: 2, height: 5 }, { scene: stage.hud }),
  });
  addToggleButton(r, () => (h.movement as ManualMovement).updateXVelocity(5), () => { });
  let d = new Actor({
    appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 8, width: 12, height: 2 }, { scene: stage.hud }),
  });
  addToggleButton(d, () => (h.movement as ManualMovement).updateYVelocity(5), () => { });
  let u = new Actor({
    appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 1, width: 12, height: 2 }, { scene: stage.hud }),
  });
  addToggleButton(u, () => (h.movement as ManualMovement).updateYVelocity(-5), () => { });

}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
