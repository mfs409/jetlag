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
    // There are three types of physical bodies in Box2D.
    // - Static bodies don't move at all, ever.
    // - Kinematic bodies can move, but are not subject to forces
    // - Dynamic bodies can move, and are subject to forces
    //
    // To illustrate the difference, we'll have a hero who moves via tilt.  It's
    // dynamic, of course.  Make it collide with each kind of body to see what
    // happens.

    // We will use tilt to control the hero, with arrow keys simulating
    // tilt on devices that lack an accelerometer
    enableTilt(10, 10);
    boundingBox();

    // The actor who can move
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
        movement: new TiltMovement(), // This makes it dynamic
        role: new Hero(),
    });

    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 4, cy: 4, radius: 0.4 }),
        role: new Obstacle(), // Defaults to static
    });

    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 6, cy: 4, radius: 0.4 }, { kinematic: true }),
        role: new Obstacle(), // The prior line overrides to kinematic
    });

    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 8, cy: 4, radius: 0.4 }, { dynamic: true }),
        role: new Obstacle(), // This one is overridden to be dynamic
    });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
