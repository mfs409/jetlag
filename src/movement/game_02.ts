import { Actor, CircleBody, Enemy, Goodie, Hero, ImageSprite, JetLagGameConfig, Obstacle, Path, PathMovement, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { enableTilt, boundingBox } from "./common";

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
    imageNames: ["sprites.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // Let's look at "path" movement.  This lets us specify a set of waypoints,
  // and the actor will move from one to the next.  We even can let paths
  // repeat.

  // Moving around in the world will make this more interesting!
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 8, cy: 8.6, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });
  enableTilt(10, 10);

  // This actor moves to a position and stops
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: .5, cy: .5 }),
    role: new Obstacle(),
    movement: new PathMovement(new Path().to(.5, .5).to(15.5, .5), 2, false),
  });

  // This actor loops, and is faster.  Also, actors on paths don't have to be
  // obstacles, they can have any role...
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: 1.5, cy: 1.5 }),
    role: new Enemy(),
    movement: new PathMovement(new Path().to(.5, 1.5).to(15.5, 1.5), 5, true),
  });

  // Since there's an enemy, we need a way to lose...
  stage.score.onLose = { level, builder }

  // The last one was a bit odd.  This one has *three* points.
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: 2.5, cy: 1.5 }),
    role: new Enemy(),
    movement: new PathMovement(new Path().to(.5, 2.5).to(15.5, 2.5).to(.5, 2.5), 5, true),
  });

  // Of course, paths can go from anywhere to anywhere... even off the screen.
  // The default is that Actors on paths are kinematic, so they can go through
  // walls.
  boundingBox();
  // Since we're going to make a complex path, let's use some code to make it:
  let p = new Path();
  let lastX = -.5;
  let lastY = 2;
  let up = true;
  while (lastX <= 16.5) {
    p.to(lastX, lastY);
    lastX += 1;
    if (up) lastY += 1; else lastY -= 1;
    up = !up;
  }
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: p.getPoint(0).x, cy: p.getPoint(0).y }),
    role: new Obstacle(),
    movement: new PathMovement(p, 5, true),
  });

  // If a point on the path is directly between two other points, you won't
  // notice it's there.  The velocity is all that matters
  let p2 = new Path().to(-.5, 5).to(8, 5).to(16.5, 5).to(-.5, 5);
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: p2.getPoint(0).x, cy: p2.getPoint(0).y }),
    role: new Obstacle(),
    movement: new PathMovement(p2, 5, true),
  });

  // But once we've done that, we can re-use the path, letting the next actor
  // jump forward by a waypoint:
  let a2 = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: p2.getPoint(0).x, cy: p2.getPoint(0).y }),
    role: new Obstacle(),
    movement: new PathMovement(p2, 5, true),
  });
  (a2.movement as PathMovement).skip_to(1);
  // Notice that we didn't get cx and cy right.  That's OK, as long as you
  // don't have too many dynamic things with the same cx/cy.

  // We can make actors on paths dynamic.  This is usually a bad idea if
  // collisions are enabled (which is, of course, the default).  Try colliding
  // with this.  It will mess up the whole path system.
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "grey_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: 2.5, cy: 1.5 }, { dynamic: true }),
    role: new Obstacle(),
    movement: new PathMovement(new Path().to(.5, 6.5).to(15.5, 6.5).to(.5, 6.5), 5, true),
  });

  // Lastly, let's observe that we can run code whenever an actor reaches a
  // waypoint.  In this example, we'll only do something on the second
  // waypoint (waypoint #1):
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "grey_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: 2.5, cy: 7.5 }),
    role: new Obstacle(),
    movement: new PathMovement(new Path().to(-.5, 7.5).to(8, 8.5).to(16.5, 7.5).to(8, 8.5).to(-.5, 7.5), 5, true, (which: number) => {
      if (which == 1 || which == 3) {
        new Actor({
          appearance: new ImageSprite({ width: .5, height: .5, img: "grey_ball.png" }),
          rigidBody: new CircleBody({ radius: .25, cx: 1.5 - Math.random(), cy: 1.5 - Math.random() }, { dynamic: true }),
          role: new Goodie(),
        });
      }
    }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
