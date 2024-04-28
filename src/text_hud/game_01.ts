import { Actor, BoxBody, CircleBody, ImageSprite, JetLagGameConfig, Path, PathMovement, TextSprite, initializeAndLaunch } from "../jetlag";

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
    imageNames: ["sprites.json"],
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Everything is an actor, and text is just the 'appearance' of the actor.
  // This mean1 that the actor's body is the "anchor" for where the text
  // will go.  The easiest thing is to center the text on the anchor.  If
  // the text isn't also supposed to be interactive, it is sufficient to
  // make a tiny body for it:
  new Actor({
    rigidBody: new CircleBody({ cx: 1, cy: 1, radius: .01 }),
    appearance: new TextSprite({ center: true, face: "Arial", size: 22, color: "#FF0000" }, "JetLag")
  });

  // Every TextSprite must have a face, size, and color.  We can add a fourth
  // pair of digits to the color to make it transparent.  There are optional
  // configuration fields for an outline, too.
  new Actor({
    rigidBody: new CircleBody({ cx: 4, cy: 4, radius: .01 }),
    appearance: new TextSprite({ center: true, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 }, "JetLag")
  });

  // Every appearance component has an optional "Z" argument, which can be -2,
  // -1, 0, 1, or 2.  This lets us control how things stack on top of each
  // other.  The default is 0.  If two things have the same Z, the one we made
  // second is the one on top.  So let's put a green ball in Z -1, to see how
  // the transparency worked on that previous text:
  new Actor({
    rigidBody: new CircleBody({ cx: 4, cy: 4, radius: .5 }),
    appearance: new ImageSprite({ width: 1, height: 1, z: -1, img: "green_ball.png" })
  });

  // Since every actor has a body, we can make Text interactive, just like
  // anything else.  The key thing is that the text's *body* is what is
  // interactive, not its appearance.  So in this case, let's make some text
  // that moves around:
  new Actor({
    rigidBody: new BoxBody({ cx: 1, cy: 1, width: .5, height: .5 }),
    appearance: new TextSprite({ center: true, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 }, "Tap Me"),
    movement: new PathMovement(new Path().to(1, 1).to(15, 1).to(15, 8).to(1, 8).to(1, 1), 4, true),
    gestures: { tap: () => { console.log("Tapped"); return true; } }
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
