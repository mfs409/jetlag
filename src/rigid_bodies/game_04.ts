import { Actor, BoxBody, CircleBody, ImageSprite, JetLagGameConfig, Obstacle, PolygonBody, TiltMovement, initializeAndLaunch } from "../jetlag";
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

    // Now let's look at the different kinds of bodies.  Keep in mind that the
    // shape of the rigidBody is completely unrelated to the appearance.  Focus
    // on the appearance of the hitbox, not the blue balls.

    // Also, note that when we make a rigidBody, we can provide some "extra"
    // configuration.  In this case, we'll make things rotate

    // Circles need a radius.
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
        rigidBody: new CircleBody({ radius: .5, cx: 1, cy: 1 }, { rotationSpeed: 5 }),
        role: new Obstacle(),
    });

    // Boxes have a width and a height
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 2, img: "blue_ball.png" }),
        rigidBody: new BoxBody({ width: 1, height: 2, cx: 3, cy: 2 }, { rotationSpeed: -.25 }),
        role: new Obstacle(),
    });

    // To make a polygon, we provide an array with the vertices.  Note that two
    // entries in a row will represent x and y coordinates of a vertex.
    //
    // Polygons can have as many points as you want (but more than 8 is usually
    // crazy), but the polygon needs to be convex.  Points are described in
    // terms of their distance from the center.  So, for example, here's a
    // circular image with a hexagonal body.
    new Actor({
        appearance: new ImageSprite({ width: 2, height: 2, img: "blue_ball.png" }),
        rigidBody: new PolygonBody(
            { cx: 6, cy: 6, vertices: [-1, 0, -.5, .866, .5, .866, 1, 0, .5, -.866, -.5, -.866] },
            { rotationSpeed: .25 }),
        role: new Obstacle(),
    });

    // The polygon's center (x,y) need not be its true center:
    new Actor({
        appearance: new ImageSprite({ width: 2, height: 2, img: "blue_ball.png" }),
        rigidBody: new PolygonBody(
            { cx: 13, cy: 6, vertices: [-1, 0, 0, 1, 1, 0] },
            { rotationSpeed: .25 }),
        role: new Obstacle(),
    });

    // Turn on tilt and put a box around the world
    enableTilt(10, 10);
    boundingBox();

    // Let's also draw an obstacle that is oblong (due to its width and height)
    // and that is rotated. Note that this should be a box, or it will not have
    // the right underlying shape.
    let o = new Actor({
        appearance: new ImageSprite({ width: 0.75, height: 0.15, img: "blue_ball.png" }),
        rigidBody: new BoxBody({ cx: 13, cy: 3, width: 0.75, height: 0.15, }),
        role: new Obstacle(),
    });
    o.rigidBody.setRotation(Math.PI / 4);

    // This actor can move around and experience the other actors' shapes
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
        movement: new TiltMovement(), // This makes it dynamic
        role: new Obstacle(),
    });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
