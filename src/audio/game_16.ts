import { Actor, BoxBody, FilledBox, JetLagGameConfig, initializeAndLaunch, stage } from "../jetlag";
import { drawMuteButton } from "./common";

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
  // Let's also look at how to make sound effects in response to gestures.
  // This idea generalizes to any reason for making a sound effect: we can
  // always just get the sound and play it.

  // Don't forget a button that lets us enable audio in the browser
  drawMuteButton({ cx: 15.5, cy: 0.5, width: 1, height: 1, scene: stage.hud });

  // If you tap this actor repeatedly, it will keep playing new copies of the
  // sound over the old ones:
  new Actor({
    appearance: new FilledBox({ width: .75, height: .75, fillColor: "#0000FF" }),
    rigidBody: new BoxBody({ cx: 1.5, cy: 1.5, width: .75, height: .75 }),
    gestures: { tap: () => { let x = stage.musicLibrary.getSound("lose_sound.ogg").play(); console.log(x); return true; } }
  });

  // This actor checks if the sound is playing, and won't start a second copy
  // while the first is still playing
  new Actor({
    appearance: new FilledBox({ width: .75, height: .75, fillColor: "#00FFFF" }),
    rigidBody: new BoxBody({ cx: 3.5, cy: 1.5, width: .75, height: .75 }),
    gestures: {
      tap: () => {
        let sound = stage.musicLibrary.getSound("lose_sound.ogg");
        if (!sound.playing()) sound.play();
        return true;
      },
    },
  });

  // This actor will stop all copies of the sound if you tap it while the
  // sound is playing
  new Actor({
    appearance: new FilledBox({ width: .75, height: .75, fillColor: "#00FF00" }),
    rigidBody: new BoxBody({ cx: 5.5, cy: 1.5, width: .75, height: .75 }),
    gestures: {
      tap: () => {
        let sound = stage.musicLibrary.getSound("lose_sound.ogg");
        if (sound.playing()) sound.stop();
        else sound.play();
        return true;
      },
    },
  });

  // This actor will pause all copies of the sound if you tap it while the
  // sound is playing
  new Actor({
    appearance: new FilledBox({ width: .75, height: .75, fillColor: "#FF00FF" }),
    rigidBody: new BoxBody({ cx: 7.5, cy: 1.5, width: .75, height: .75 }),
    gestures: {
      tap: () => {
        let sound = stage.musicLibrary.getSound("lose_sound.ogg");
        if (sound.playing()) sound.pause();
        else sound.play();
        return true;
      },
    },
  });

  // This actor uses its extra to keep track of the ID of the sound, and only
  // manages its own sound
  new Actor({
    appearance: new FilledBox({ width: .75, height: .75, fillColor: "#FFFF00" }),
    rigidBody: new BoxBody({ cx: 9.5, cy: 1.5, width: .75, height: .75 }),
    gestures: {
      tap: (a: Actor) => {
        let sound = stage.musicLibrary.getSound("lose_sound.ogg");
        if (sound.playing(a.extra.soundId)) sound.pause(a.extra.soundId);
        else a.extra.soundId = sound.play();
        return true;
      },
    },
    extra: { soundId: -1 } // -1 is smaller than any value returned by play()
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
