import { Actor, CircleBody, ImageSprite, JetLagGameConfig, Obstacle, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, levelController } from "./common";

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

    // It's also the case that gravity doesn't affect kinematic bodies!
    boundingBox();
    // Note: you could have negative gravity, to make things float upward...
    stage.world.setGravity(0, 10);

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

    // Later on, we'll see that sometimes we want code to run when a collision
    // happens.  An additional requirement is that the collision won't be
    // detected unless at least one body is dynamic.
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
