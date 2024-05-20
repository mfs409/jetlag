import { Actor, AnimatedSprite, AnimationSequence, AnimationState, BoxBody, CircleBody, Goodie, Hero, ImageSprite, JetLagGameConfig, KeyCodes, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true;
  // Here's where we name all the images/sounds/background music files.
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
function builder(_level: number) {
  // In this level, we will have tilt to move left/right, but there is so much
  // friction that tilt will only be effective when the hero is in the air.
  // This will let us watch how some of the animations work in side-view
  // games.  We'll also do a disappearance animation.
  stage.world.setGravity(0, 10);
  enableTilt(10, 0);
  boundingBox()

  stage.backgroundColor = "#17b4ff";
  // Layers can be a nice way to make backgrounds even when there isn't scrolling :)
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5, }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 });

  // The hero has one animation when it is not in the air, another when it is
  // Note that "jump_right" will also be used when jumping to the left, if
  // there is no "jump_left"

  // We'll set up idle_right and jump_right 
  let idle_right = AnimationSequence.makeSimple({ timePerFrame: 150, repeat: true, images: ["color_star_1.png", "color_star_2.png"] })
  let jump_right = AnimationSequence.makeSimple({ timePerFrame: 150, repeat: true, images: ["color_star_4.png", "color_star_6.png"] });
  let animations = new Map();
  animations.set(AnimationState.IDLE_E, idle_right);
  animations.set(AnimationState.JUMP_E, jump_right);
  // Remap JUMP_W to JUMP_E
  let remap = new Map();
  remap.set(AnimationState.JUMP_W, AnimationState.JUMP_E);

  let h = new Actor({
    appearance: new AnimatedSprite({ width: 0.8, height: 0.8, animations, remap }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 7, radius: 0.4 }, { density: 5, friction: 0.6, disableRotation: true }),
    movement: new TiltMovement(),
    role: new Hero(),
  });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (h.role as Hero).jump(0, -5); });

  // Instead of remapping JUMP_NE, JUMP_SE, JUMP_NW, JUMP_SW, we can tell the
  // AnimatedSprite that this is a side-scroll game, and it will do the work
  // for us.
  (h.appearance[0] as AnimatedSprite).stateSelector = AnimatedSprite.sideViewAnimationTransitions;

  // We can make "disappear" animations by turning "repeat" to false when
  // putting an animation where an actor used to be:
  new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "star_burst_3.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 7.5, radius: 0.25 }),
    role: new Goodie(),
    onDisappear: (a: Actor) => {
      let animations = new Map();
      animations.set(AnimationState.IDLE_E, new AnimationSequence(false).to("star_burst_3.png", 200).to("star_burst_2.png", 200).to("star_burst_1.png", 200).to("star_burst_4.png", 200));
      new Actor({
        appearance: new AnimatedSprite({ animations, width: .5, height: .5 }),
        rigidBody: new BoxBody({ cx: a.rigidBody.getCenter().x, cy: a.rigidBody.getCenter().y, width: .5, height: .5 }, { collisionsEnabled: false }),
      })
    }
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
