import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, initializeAndLaunch } from "../jetlag";
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
        imageNames: ["green_ball.png", "purple_ball.png"]
    };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
    // Hmm, kinematic and static looked the same!  This time, let's explicitly
    // give things a velocity, and watch what happens
    boundingBox();
    enableTilt(10, 10);

    // The actor who can move
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
        movement: new TiltMovement(), // This makes it dynamic
        role: new Hero(),
    });

    let s = new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 4, cy: 4, radius: 0.4 }),
        role: new Obstacle(), // Defaults to static
    });

    let k = new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 6, cy: 4, radius: 0.4 }, { kinematic: true }),
        role: new Obstacle(),
    });

    let d = new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 8, cy: 4, radius: 0.4 }, { dynamic: true }),
        role: new Obstacle(),
    });

    k.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })
    d.rigidBody.body.SetLinearVelocity({ x: -1, y: 0 })
    s.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })

    // The static one did not move.  The kinematic one did not experience a
    // transfer of momentum.  The dynamic one did.

    // To convince ourselves, let's repeat the experiment with two kinematics,
    // and again with two dynamics:
    let k1 = new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 6, cy: 2, radius: 0.4 }, { kinematic: true }),
        role: new Obstacle(),
    });
    let k2 = new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 8, cy: 2, radius: 0.4 }, { kinematic: true }),
        role: new Obstacle(),
    });
    k1.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })
    k2.rigidBody.body.SetLinearVelocity({ x: -1, y: 0 })

    let d1 = new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 6, cy: 6, radius: 0.4 }, { dynamic: true }),
        role: new Obstacle(),
    });
    let d2 = new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 8, cy: 6, radius: 0.4 }, { dynamic: true }),
        role: new Obstacle(),
    });
    d1.rigidBody.body.SetLinearVelocity({ x: 1, y: 0 })
    d2.rigidBody.body.SetLinearVelocity({ x: -1, y: 0 })

    // Be sure to let this run for a while, so you can see how the middle row
    // behaves very oddly when things reach the boundary.
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
