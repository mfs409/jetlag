import { Actor, BoxBody, CircleBody, FilledBox, FilledCircle, FilledPolygon, JetLagGameConfig, PolygonBody, initializeAndLaunch } from "../jetlag";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9};
  hitBoxes = true;
  // Here's where we name all the images/sounds/background music files.
  resources = {
    prefix: "./assets/",
    soundNames: [
      "flap_flap.ogg", "high_pitch.ogg", "low_pitch.ogg", "lose_sound.ogg",
      "slow_down.ogg", "win_sound.ogg"
    ],
    imageNames: [
      "alien.json", "sprites.json", "noise.png", "mid.png", "back.png"
    ]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Pretty much everything in JetLag is an Actor, and every actor has an
  // "appearance" component.  There are three kinds of appearance components:
  // ImageSprite, AnimatedSprite, and filled shapes.  There are three kinds of
  // filled shapes, which we'll see here.  Notice that the filled shape does
  // not need to look anything like the underlying rigid body.

  // Filled shapes (and all colors in JetLag, for that matter) are described
  // in terms of red, green, and blue.  Each part is two characters, with each
  // character being in the range [0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F].
  // Capitalization doesn't matter.  So the color #DECC02 has a red of DE, a
  // green of CC, and a blue of 02.  You can learn more at
  // https://www.w3schools.com/colors/colors_picker.asp

  // A circle.  It is filled red.  It has a green outline.  The body has a
  // bigger radius
  new Actor({
    appearance: new FilledCircle({ radius: .5, fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
  })

  // A rectangle.  It is filled blue.  It has no outline.  The body has a
  // smaller perimeter and different shape
  new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 4, width: 2, height: 2 }),
    appearance: new FilledBox({ width: 1, height: .5, fillColor: "#0000ff" }),
  })

  // A polygon.  The fourth color channel is "alpha", and 00 means
  // "transparent", even though it looks like it should be red.
  new Actor({
    rigidBody: new PolygonBody({ cx: 10, cy: 5, vertices: [0, -.5, .5, 0, 0, .5, -1, 0] }),
    appearance: new FilledPolygon({ vertices: [0, -.5, .5, 0, 0, .5, -1, 0], fillColor: "#ff000000", lineWidth: 4, lineColor: "#00ff00" }),
  })
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
