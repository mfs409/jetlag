import { Actor, BoxBody, CircleBody, FilledBox, ImageSprite, JetLagGameConfig, ManualMovement, Path, PathMovement, b2Vec2, initializeAndLaunch, stage } from "../jetlag";
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

  // In the previous levels, any single kind of gesture only happened in one
  // place.  What if we want a kind of gestures to be handled on the HUD and
  // in the world?
  boundingBox();

  // Track the actor most recently tapped
  let lastTapActor: Actor | undefined = undefined;

  // make an actor who can "teleport".  Tapping it will "activate" it.
  // Double-tapping will remove it
  const teleport_actor = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 14, cy: 1, radius: .5 }),
    gestures: {
      tap: () => {
        let x = stage.renderer.now; // Time of this tap
        // If it's been less than 300 milliseconds since the last tap, remove
        // it
        if (x - teleport_actor.extra.last_tap < 300 && lastTapActor == teleport_actor) {
          lastTapActor = undefined;
          teleport_actor.remove();
          return true;
        }
        // Otherwise, remember the time of the tap, and that it is activated
        teleport_actor.extra.last_tap = x;
        lastTapActor = teleport_actor;
        return true;
      }
    },
    extra: {
      last_tap: 0,
      poke_responder: (meters: { x: number, y: number }) => { teleport_actor.rigidBody.setCenter(meters.x, meters.y); }
    }
  });



  // Make the tappable region on the hud
  new Actor({
    appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    gestures: {
      tap: (_actor: Actor, hudCoords: { x: number; y: number }) => {
        if (!lastTapActor) return false;
        let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
        let meters = stage.world.camera.screenToMeters(pixels.x, pixels.y);
        // "teleport" the actor:
        lastTapActor.extra.poke_responder(meters);
        // don't interact again without re-activating
        lastTapActor = undefined;
        return true;
      }
    }
  });

  // This effectively puts the tappable region "under" the world, so that
  // pokes can find an actor before trying to move an actor.
  stage.gestures.gestureHudFirst = false;


  // make an actor who can move along a path.
  const path_actor = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 14, cy: 2, radius: .5 }),
    movement: new PathMovement(new Path().to(14, 2).to(14, 2), 0, false),
    gestures: {
      tap: () => { lastTapActor = path_actor; return true; }
    },
    extra: {
      poke_responder: (meters: { x: number, y: number }) => {
        let r = new Path().to(path_actor.rigidBody.getCenter().x, path_actor.rigidBody.getCenter().y).to(meters.x, meters.y);
        path_actor.rigidBody.body.SetLinearVelocity({ x: 0, y: 0 });
        path_actor.rigidBody.body.SetAngularVelocity(0);
        (path_actor.movement as PathMovement).resetPath(r, 5, false);
      }
    }
  });

  // This actor will move in a direction, but won't stop
  const walk_actor = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 14, cy: 3, radius: .5 }),
    movement: new ManualMovement(),
    gestures: {
      tap: () => { lastTapActor = walk_actor; return true; }
    },
    extra: {
      poke_responder: (meters: { x: number, y: number }) => {
        let speed = 2;
        // This might be a nice time to brush up on your trigonometry :)
        let dx = meters.x - walk_actor.rigidBody.getCenter().x;
        let dy = meters.y - walk_actor.rigidBody.getCenter().y;
        let hy = Math.sqrt(dx * dx + dy * dy) / speed;
        let v = new b2Vec2(dx / hy, dy / hy);
        walk_actor.rigidBody.body.SetAngularVelocity(0);
        walk_actor.rigidBody.body.SetLinearVelocity(v);
      }
    }
  });
}


// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
