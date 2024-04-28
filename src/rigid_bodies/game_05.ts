import { Actor, CircleBody, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt, levelController } from "./common";

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
        imageNames: ["sprites.json", "mid.png"]
    };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
    // Set up the level controller, so we can easily switch among levels
    levelController(level, 19, builder);

    // In the last level, watch what happens if you change the last actor's
    // role.  Suddenly, it goes through everything else, even though it's
    // dynamic!  There's a bit more at play.  The first thing is that some
    // `roles` are defined not to interact with each other (or with anything).
    // The other is that the default role is "Passive", which doesn't collide
    // with *anything*.
    //
    // We can get that behavior in any actor.  So, for example, this hero will
    // go through the walls, even though it's not Passive:

    boundingBox();
    enableTilt(10, 10);
    // While we're at it, we're going to change how tilt works... let's make it
    // affect velocity directly, instead of inducing forces:
    stage.tilt.tiltVelocityOverride = true;

    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }, { collisionsEnabled: false }),
        movement: new TiltMovement(),
        role: new Obstacle(),
    });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
