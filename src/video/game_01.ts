import { Actor, BoxBody, CircleBody, Destination, Hero, ImageSprite, JetLagGameConfig, Scene, TextSprite, TiltMovement, VideoSprite, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all the
 * assets (images, sounds, and videos) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9};
  hitBoxes = true;
  resources = {
    prefix: "./assets/",
    imageNames: ["sprites.json"],
    videoNames: ["big_buck_bunny.mp4"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // In this example, we're going to implement our cut scene as a *level*.  The
  // way we'll do that is by setting up level 1 as a menu, level 2 as a video
  // cut scene, and level 3 as the game to play.
  //
  // Note that this code has an ugly little trick in it.  Web browsers normally
  // refuse to play video or audio until there is a gesture on the page.  If
  // your game is running as a mobile or desktop app, this rule may not apply.
  // But when running in a browser, you can't start playing a video until there
  // is *some* gesture.  In our case, the tap in level 1 is all we need...
  // there's been a gesture since the page was loaded, so now video will work.
  if (level == 1) {
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: "#000000", size: 24 }, "Press Me"),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }),
      gestures: { tap: () => { stage.switchTo(builder, 2); return true; } }
    });
  }

  else if (level == 2) {
    // Notice that it might start playing automatically.  But if we previously
    // used this same mp4, and paused it, then it won't.  So let's just
    // explicitly start playing it.
    let a = new Actor({
      appearance: new VideoSprite({ width: 16, height: 9, vid: "big_buck_bunny.mp4" }),
      rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
    });
    (a.appearance[0] as VideoSprite).reset();
    (a.appearance[0] as VideoSprite).play();
    (a.appearance[0] as VideoSprite).onEnd(() => stage.switchTo(builder, 3));
  }

  else if (level == 3) {
    // In this level, we'll implement the cut scene as an overlay that appears
    // when the player wins.  We'll also put a few buttons on the screen that
    // can control the video.

    // Put a box around our 16x9 screen
    boundingBox();

    // Make a hero who moves via tilt
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 5, cy: 2, radius: .5 }),
      role: new Hero(),
      movement: new TiltMovement(),
    });

    // Make a destination
    new Actor({
      rigidBody: new CircleBody({ cx: 3, cy: 4, radius: .5 }),
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      role: new Destination(),
    });

    // Enable tilt using a helper function that also sets up arrow keys to
    // simulate tilt
    enableTilt(5, 5);

    // There's no losing, but say what to do when the level is won
    stage.score.onWin = { level: 4, builder };

    stage.score.winSceneBuilder = (overlay: Scene) => {
      // Make the video
      let a = new Actor({
        appearance: new VideoSprite({ width: 12, height: 27 / 4, vid: "big_buck_bunny.mp4" }),
        rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }, { scene: overlay }),
      });

      // The video might be at the end.  It might be paused.  Best to reset everything just to be safe:
      (a.appearance[0] as VideoSprite).reset();
      (a.appearance[0] as VideoSprite).play();

      // Now let's put some controls on top of it

      // This button can reset the video.  If it's paused, don't un-pause.  If
      // it's playing, don't pause.
      new Actor({
        appearance: new ImageSprite({ width: .25, height: .25, img: "left_arrow.png" }),
        rigidBody: new BoxBody({ cx: 7.5, cy: 7.5, width: .25, height: .25 }, { scene: overlay }),
        gestures: {
          tap: () => {
            (a.appearance[0] as VideoSprite).reset();
            return true;
          }
        },
      });

      // This button is a toggle between pause and play.  We're using the wrong
      // icon for play, because the `sprites.json` sprite sheet doesn't have a
      // good play image.
      let playing = true;
      new Actor({
        appearance: new ImageSprite({ width: .25, height: .25, img: "pause.png" }),
        rigidBody: new BoxBody({ cx: 8, cy: 7.5, width: .25, height: .25 }, { scene: overlay }),
        gestures: {
          tap: (actor: Actor) => {
            if (playing) {
              playing = false;
              (actor.appearance[0] as ImageSprite).setImage("back_arrow.png");
              (a.appearance[0] as VideoSprite).pause();
            }
            else {
              playing = true;
              (actor.appearance[0] as ImageSprite).setImage("pause.png");
              (a.appearance[0] as VideoSprite).play();
            }
            return true;
          }
        },
      });

      // This button moves to the next level.  You don't have to watch the video
      // before it starts working.
      new Actor({
        appearance: new ImageSprite({ width: .25, height: .25, img: "right_arrow.png" }),
        rigidBody: new BoxBody({ cx: 8.5, cy: 7.5, width: .25, height: .25 }, { scene: overlay }),
        gestures: {
          tap: () => {
            stage.clearOverlay();
            stage.switchTo(builder, 4);
            (a.appearance[0] as VideoSprite).pause();
            return true;
          }
        },
      });

      // We'll say that once the video ends, immediately jump to the next level
      (a.appearance[0] as VideoSprite).onEnd(() => {
        stage.clearOverlay();
        stage.switchTo(builder, 4);
      });
    }
  }

  // This level just puts a message on the screen.  Tapping resets the game to
  // level 1
  else if (level == 4) {
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: "#000000", size: 24 }, "Start Over"),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }),
      gestures: { tap: () => { stage.switchTo(builder, 1); return true; } }
    });
  }
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
