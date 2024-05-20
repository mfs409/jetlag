import { Actor, BoxBody, CircleBody, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, initializeAndLaunch } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

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
        imageNames: ["green_ball.png"]
    };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
    enableTilt(10, 10);
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }, { density: 5, friction: .3 }),
        movement: new TiltMovement(),
        role: new Obstacle(),
    });
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new BoxBody({ cx: 4, cy: 3, width: .8, height: .8 }, { density: 5, friction: .3 }),
        movement: new TiltMovement(),
        role: new Obstacle(),
    });

    // The way that the ball glided across the floor was odd.  Let's give the walls friction...
    let walls = boundingBox();
    walls.l.rigidBody.setPhysics({ friction: .6 })
    walls.r.rigidBody.setPhysics({ friction: .6 })
    walls.t.rigidBody.setPhysics({ friction: .6 })
    walls.b.rigidBody.setPhysics({ friction: .6 })
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
