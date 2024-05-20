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
    // There are many other customizations we can put into that second field.
    // Let's look at density, elasticity, and friction
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

    // Note that boundingBox() returns the four walls, so we can put adjust
    // their physics properties.
    let walls = boundingBox();
    walls.b.rigidBody.setPhysics({ friction: .4 });
    walls.l.rigidBody.setPhysics({ elasticity: .2 });
    // Be sure to play around with the arrow keys to make things collide

    // Note that the default is for everything to have density=1, elasticity=0,
    // and friction=0.  You should make same-sized actors with different
    // densities, and watch what happens when they collide!  You should also
    // watch what happens when you make elasticity too big (try 100, for
    // example...)
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
