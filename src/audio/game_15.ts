import { Actor, CircleBody, Destination, Enemy, Hero, ImageSprite, JetLagGameConfig, KeyCodes, Obstacle, Projectile, ProjectileMovement, SoundEffectComponent, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, drawMuteButton, enableTilt } from "./common";

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
function builder(level: number) {
  // We're not going to explore *music* in this tutorial, because the
  // stage_transitions tutorial does a pretty good job with it.  But we should
  // take a minute to look at sounds.  Sounds are for quick bursts of audio,
  // not looped background tracks (that's "music").  To use sounds, we just
  // add a sound component to an actor.  There are six sounds: toss,
  // disappear, arrive, defeat, jump, and collide.  Let's test them all:

  boundingBox();
  enableTilt(10, 0);
  stage.world.setGravity(0, 10);

  // First: you always need a gesture before a web page will play audio, so
  // let's put a mute/unmute button on the HUD:
  drawMuteButton({ cx: 15.5, cy: 0.5, width: 1, height: 1, scene: stage.hud });

  // disappear and collide will both be attached to this obstacle
  let o = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
    role: new Obstacle(),
    sounds: new SoundEffectComponent({ collide: "flap_flap.ogg", disappear: "high_pitch.ogg" }),
    gestures: { tap: () => { o.remove(); return true; } }
  });

  // The hero will have a jump sound, and its projectiles will make toss
  // sounds
  let h = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
    role: new Hero(),
    movement: new TiltMovement(),
    sounds: new SoundEffectComponent({ jump: "slow_down.ogg" }),
    gestures: {
      tap: () => {
        let p = new Actor({
          appearance: new ImageSprite({ width: .2, height: .2, img: "grey_ball.png" }),
          rigidBody: new CircleBody({ cx: h.rigidBody.getCenter().x + .2, cy: h.rigidBody.getCenter().y, radius: .1 }),
          movement: new ProjectileMovement(),
          role: new Projectile(),
          sounds: new SoundEffectComponent({ toss: "low_pitch.ogg" })
        });
        // We can use "tossFrom" to throw in a specific direction, starting at a
        // point, such as the hero's center.
        (p.role as Projectile).tossFrom(h, .2, 0, 5, 0);
        return false;
      }
    }
  });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (h.role as Hero).jump(0, -7.5) });

  // Defeat the enemy to get a defeat sound
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
    role: new Enemy(),
    sounds: new SoundEffectComponent({ defeat: "lose_sound.ogg" }),
  });

  // Reach the destination for an arrive sound
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 14.5, cy: 8.5, radius: .5 }),
    role: new Destination(),
    sounds: new SoundEffectComponent({ arrive: "win_sound.ogg" }),
  });

  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // You'll notice that long sounds don't work very well.  It's up to you to
  // create delays as needed by your soundtrack.
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
