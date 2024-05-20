import { Actor, BoxBody, CircleBody, FilledBox, FilledCircle, FilledPolygon, Hero, ImageSprite, JetLagGameConfig, Obstacle, PolygonBody, TextSprite, TiltMovement, initializeAndLaunch } from "../jetlag";
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
        imageNames: ["green_ball.png", "red_ball.png", "blue_ball.png"]
    };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
    // This level shows that we can make entities that shrink or grow.  You
    // could probably put the shrinking / growing onto a timer.
    enableTilt(10, 10);
    boundingBox();

    // A hero, for exploring the world
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new CircleBody({ cx: 8, cy: 8, radius: 0.4, }),
        movement: new TiltMovement(),
        role: new Hero(),
    });

    // A circle.  Tap it to make it shrink a little bit
    new Actor({
        appearance: new FilledCircle({ radius: .5, fillColor: "#FF0000" }),
        rigidBody: new CircleBody({ cx: 2, cy: 2, radius: .5 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (shrinkCircle) => { shrinkCircle.resize(.8); return true; } },
        role: new Obstacle(),
        extra: { radius: .5 }
    });

    // A box.  Tap it to make it shrink a little bit
    new Actor({
        appearance: new FilledBox({ width: 1, height: 2, fillColor: "#FF0000" }),
        rigidBody: new BoxBody({ cx: 4, cy: 2, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (shrinkBox) => { shrinkBox.resize(.8); return true; } },
        role: new Obstacle(),
    });

    // A circle.  Tap it to make it grow a little bit
    new Actor({
        appearance: new FilledCircle({ radius: .5, fillColor: "#0000FF" }),
        rigidBody: new CircleBody({ cx: 2, cy: 5, radius: .5 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (growCircle) => { growCircle.resize(1.2); return true; } },
        role: new Obstacle(),
    });

    // A box.  Tap it to make it grow a little bit
    new Actor({
        appearance: new FilledBox({ width: 1, height: 2, fillColor: "#0000FF" }),
        rigidBody: new BoxBody({ cx: 4, cy: 5, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (growBox) => { growBox.resize(1.2); return true; } },
        role: new Obstacle(),
    });

    // A circle with an image.  Tap it to make it shrink a little bit
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
        rigidBody: new CircleBody({ cx: 6, cy: 2, radius: .5 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (shrinkCircleImage) => { shrinkCircleImage.resize(.8); return true; } },
        role: new Obstacle(),
    });

    // A box with an image.  Tap it to make it shrink a little bit
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 2, img: "red_ball.png" }),
        rigidBody: new BoxBody({ cx: 8, cy: 2, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (shrinkBoxImage) => { shrinkBoxImage.resize(.8); return true; } },
        role: new Obstacle(),
    });

    // A circle with an image.  Tap it to make it grow a little bit
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
        rigidBody: new CircleBody({ cx: 6, cy: 5, radius: .5 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (growCircleImage) => { growCircleImage.resize(1.2); return true; } },
        role: new Obstacle(),
    });

    // A box with an image.  Tap it to make it grow a little bit
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 2, img: "blue_ball.png" }),
        rigidBody: new BoxBody({ cx: 8, cy: 5, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (growBoxImage) => { growBoxImage.resize(1.2); return true; } },
        role: new Obstacle(),
    });

    // A circle with text.  Tap it to make it shrink a little bit
    new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#FF0000" }, "hello"),
        rigidBody: new CircleBody({ cx: 10, cy: 2, radius: .5 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (shrinkCircleText) => { shrinkCircleText.resize(.8); return true; } },
        role: new Obstacle(),
    });

    // A box with text.  Tap it to make it shrink a little bit
    new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#FF0000" }, "hello"),
        rigidBody: new BoxBody({ cx: 12, cy: 2, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (shrinkBoxText) => { shrinkBoxText.resize(.8); return true; } },
        role: new Obstacle(),
    });

    // A circle with text.  Tap it to make it grow a little bit
    new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#0000FF" }, "hello"),
        rigidBody: new CircleBody({ cx: 10, cy: 5, radius: .5 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (growCircleText) => { growCircleText.resize(1.2); return true; } },
        role: new Obstacle(),
    });

    // A box with text.  Tap it to make it grow a little bit
    new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#0000FF" }, "hello"),
        rigidBody: new BoxBody({ cx: 12, cy: 5, width: 1, height: 2 }, { density: 5, friction: 0.6 }),
        gestures: { tap: (growBoxText) => { growBoxText.resize(1.2); return true; } },
        role: new Obstacle(),
    });

    // A polygon.  Tap it to make it shrink a little bit
    new Actor({
        appearance: new FilledPolygon({ vertices: [-1, -1, 0, 1, -1, 1], fillColor: "#FF0000" }),
        rigidBody: new PolygonBody({ cx: 14, cy: 2, vertices: [-1, -1, 0, 1, -1, 1] }),
        gestures: { tap: (shrinkPoly) => { shrinkPoly.resize(.8); return true; } },
        role: new Obstacle(),
    });

    // A polygon.  Tap it to make it grow a little bit
    new Actor({
        appearance: new FilledPolygon({ vertices: [-1, -1, 0, 1, -1, 1], fillColor: "#0000FF" }),
        rigidBody: new PolygonBody({ cx: 14, cy: 5, vertices: [-1, -1, 0, 1, -1, 1] }),
        gestures: { tap: (growPoly) => { growPoly.resize(1.2); return true; } },
        role: new Obstacle(),
    });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
