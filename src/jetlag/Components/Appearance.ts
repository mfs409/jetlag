import { b2Vec2 } from "@box2d/core";
import { Text, Sprite } from "../Services/ImageLibrary";
import { CameraService } from "../Services/Camera";
import { Actor } from "../Entities/Actor";
import { AnimationState, StateEvent, IStateObserver, ActorState, DIRECTION } from "./StateManager";
import { stage } from "../Stage";
import { Graphics, Sprite as PixiSprite, Particle, ParticleContainer, Texture, TextStyleOptions } from "pixi.js";
import { SpriteLocation } from "../Devices/Renderer";

/**
 * The valid Z indices in JetLag, in ascending order.  Please do not hard-code Z
 * values other than 0.
 */
export const Z_INDICES = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;

/** ZIndex is a convenience type to enforce that a value is a valid Z index */
export type ZIndex = typeof Z_INDICES[number];

/** The furthest-back Z index */
export const MIN_Z_INDEX: ZIndex = Z_INDICES[0];

/** The furthest-forward Z index */
export const MAX_Z_INDEX: ZIndex = Z_INDICES[Z_INDICES.length - 1];

/**
 * Validate a filled Box/Circle/Polygon's line/fill information
 *
 * @param cfg The object being validated
 */
function validateFilledConfig(cfg: FilledBox | FilledCircle | FilledPolygon | FilledRoundedBox) {
  const cfgName = cfg.constructor.name;

  // Validate: if there's a line width, there needs to be a line color
  if (cfg.lineWidth !== undefined && cfg.lineColor === undefined) {
    stage.console.log(`Error: ${cfgName} with lineWidth must have lineColor`);
  }

  // Validate: if there's a line color, there needs to be a line width
  else if (cfg.lineColor !== undefined && cfg.lineWidth === undefined) {
    stage.console.log(`Error: ${cfgName} with lineColor must have lineWidth`);
  }
}

/**
 * TextSprite describes any text object that can be drawn to the screen. The
 * text that is displayed can be controlled by a callback, so that it can change
 * over time.
 */
export class TextSprite {
  /** The Actor to which this TextSprite is attached */
  public actor?: Actor;
  /** The low-level text object that we pass to the Renderer */
  readonly text: Text;
  /** Width of the text (computed) */
  width = 0;
  /** Height of the text (computed) */
  height = 0;
  /** Z index of the image */
  z: ZIndex;
  /** Should the text be centered at X,Y (true) or is (X,Y) top-left (false) */
  center: boolean;

  /** The name of the font to use */
  public get face() { return this._face; }
  /** The name of the font to use */
  public set face(v: string) { this._face = v; this.rebuildStyle(); }
  /** The name of the font to use */
  private _face: string;

  /** Color for the text */
  public get color() { return this._color; }
  /** Color for the text */
  public set color(v: string) { this._color = v; this.rebuildStyle(); }
  /** Color for the text */
  private _color: string;

  /** Font size */
  public get size() { return this._size; }
  /** Font size */
  public set size(v: number) { this._size = v; this.rebuildStyle(); }
  /** Font size */
  private _size: number;

  /** Line height, as a multiple of font size */
  public get lineHeight() { return this._lineHeight; }
  /** Line height, as a multiple of font size */
  public set lineHeight(v: number) { this._lineHeight = v; this.rebuildStyle(); }
  /** Line height, as a multiple of font size */
  private _lineHeight: number;

  /** Stroke width */
  public get strokeWidth() { return this._strokeWidth; }
  /** Stroke width */
  public set strokeWidth(v: number | undefined) { this._strokeWidth = v; this.rebuildStyle(); }
  /** Stroke width */
  private _strokeWidth?: number;

  /** Stroke color */
  public get strokeColor() { return this._strokeColor; }
  /** Stroke color */
  public set strokeColor(v: string | undefined) { this._strokeColor = v; this.rebuildStyle(); }
  /** Stroke color */
  private _strokeColor?: string;

  /**
   * Width, in meters, at which the text word-wraps onto multiple lines.  If
   * undefined, the text never wraps.  When wrapping, lines are centered if
   * `center` is true, and left-aligned otherwise.
   */
  public get wrapWidth() { return this._wrapWidth; }
  /** Width, in meters, at which the text word-wraps (undefined = no wrap) */
  public set wrapWidth(v: number | undefined) { this._wrapWidth = v; this.rebuildStyle(); }
  /** Width, in meters, at which the text word-wraps (undefined = no wrap) */
  private _wrapWidth?: number;

  /** An offset between the TextSprite's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Build some text that can be rendered
   *
   * @param cfg.center      Should the text be centered at the rigid body's
   *                        (cx,cy) (true) or is the rigid body's (cx,cy)
   *                        top-left (false)?
   * @param cfg.face        Name of the font to use
   * @param cfg.color       Color for the text (should be an RGB string code,
   *                        like #aa4433)
   * @param cfg.size        Font size
   * @param cfg.z           An optional z index in the range [-4,4] (default 0)
   * @param cfg.strokeWidth The width of the text outline (optional)
   * @param cfg.strokeColor The color of the text outline (optional)
   * @param cfg.lineHeight  Line height, as a multiple of font size (optional,
   *                        default 1.25)
   * @param cfg.wrapWidth   If provided, the text word-wraps onto multiple
   *                        lines so that it stays within this many meters of
   *                        width (optional).  Lines are centered if `center`
   *                        is true, and left-aligned otherwise.
   * @param cfg.offset      An offset between the component's center and its
   *                        RigidBody's center (optional)
   * @param producer        A function that creates the text to display, or a
   *                        String
   */
  constructor(cfg: { center: boolean, face: string, color: string, size: number, z?: ZIndex, strokeWidth?: number, strokeColor?: string, lineHeight?: number, wrapWidth?: number, offset?: { dx: number, dy: number } }, public producer: string | ((a: Actor) => string)) {
    this.center = cfg.center;
    this._face = cfg.face;
    this._color = cfg.color;
    this._size = cfg.size;
    this.z = cfg.z ? cfg.z : 0;
    this._strokeWidth = cfg.strokeWidth;
    this._strokeColor = cfg.strokeColor;
    this._lineHeight = cfg.lineHeight ?? 1.25;
    this._wrapWidth = cfg.wrapWidth;
    let sample_text = (typeof this.producer == "string") ? this.producer : "";
    let style: Partial<TextStyleOptions> = { fontFamily: this._face, fontSize: this._size, fill: this._color, lineHeight: this._size * this._lineHeight };
    if (cfg.strokeColor || cfg.strokeWidth) {
      style.stroke = { color: cfg.strokeColor ?? 0x000000, width: cfg.strokeWidth ?? 1 };
    }
    if (cfg.wrapWidth !== undefined) {
      style.wordWrap = true;
      style.wordWrapWidth = cfg.wrapWidth * stage.pixelMeterRatio;
      style.align = this.center ? "center" : "left";
    }
    this.text = Text.makeText(sample_text, style);
    this.width = this.text.text.width;
    this.height = this.text.text.height;
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
  }

  /** The `fontScaling` that the current style was built with */
  private fontScalingCache = stage.fontScaling;

  /**
   * Re-derive the PIXI text style from `face`/`color`/`size`/`strokeWidth`/
   * `strokeColor`/`lineHeight`/`wrapWidth` and apply it in place.  This lets us resize
   * fonts correctly on a screen dimension change.
   */
  private rebuildStyle() {
    this.fontScalingCache = stage.fontScaling;
    Object.assign(this.text.text.style, {
      fontFamily: this._face,
      fontSize: Math.floor(this._size * stage.fontScaling),
      fill: this._color,
      lineHeight: Math.floor(this._size * this._lineHeight * stage.fontScaling),
      stroke: (this._strokeColor || this._strokeWidth) ? { color: this._strokeColor ?? 0x000000, width: this._strokeWidth ?? 1 } : undefined,
      // wordWrapWidth is in pixels, so it must be recomputed whenever the
      // pixel/meter ratio changes
      wordWrap: this._wrapWidth !== undefined,
      wordWrapWidth: (this._wrapWidth ?? 0) * stage.pixelMeterRatio,
      align: (this._wrapWidth !== undefined && this.center) ? "center" : "left",
    });
    this.width = this.text.text.width;
    this.height = this.text.text.height;
  }

  /**
   * Render the text
   *
   * @param camera      The camera that defines the bounds for the Scene where
   *                    this image should be drawn
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor) {
      // Update the text before passing to the renderer!
      // The window might have changed size since the style was built
      if (this.fontScalingCache !== stage.fontScaling) this.rebuildStyle();
      this.text.text.text = (typeof this.producer == "string") ? this.producer : this.producer(this.actor);
      this.width = this.text.text.width;
      this.height = this.text.text.height;
      stage.renderer.addTextToFrame(this, this.actor.rigidBody, camera, this.center, this.z, location);
    }
  }

  /** Perform any custom updates to the text before displaying it */
  prerender() { }

  /**
   * Return the width and height of the text
   *
   * @param camera      The camera of the scene where the text is being drawn
   * @param sampleText  Some text whose size we're computing, since the object's
   *                    real text might not be available yet
   *
   * @returns The width and height of the text, in meters
   */
  dims(camera: CameraService, sampleText: string) {
    // NB:  When the game starts, text.text will usually be "", which gets us a
    //      valid height but not a valid width.  Swapping in sampleText gets us
    //      a better estimate.
    let t = this.text.text.text;
    this.text.text.text = sampleText;
    let res = { width: this.text.text.width / camera.scale, height: this.text.text.height / camera.scale };
    this.text.text.text = t;
    return res;
  }

  /**
   * Change the size of the text.  You shouldn't call this directly.  It gets
   * called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  resize(scale: number) {
    if (this._strokeWidth !== undefined) this._strokeWidth *= scale;
    this._size *= scale;
    this.rebuildStyle();
  }
}

/**
 * ImageSprite describes any object whose visual representation is a single
 * image that is not animated.
 */
export class ImageSprite {
  /** The Actor to which this ImageSprite is attached */
  public actor?: Actor;

  /** The image to display for this actor */
  public image: Sprite;

  /** Width of the image */
  width: number;
  /** Height of the image */
  height: number;
  /** Z index of the image */
  z: ZIndex;

  /** The name of the image file (empty if this ImageSprite wraps a raw PixiSprite instead of a named image) */
  public get img() { return this._img; }
  /** Changing this loads the new named image and swaps it in immediately. */
  public set img(v: string) { this._img = v; this.image = stage.imageLibrary.getSprite(v); }
  private _img: string;

  /** An offset between the ImageSprite's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Build an image that can be rendered
   *
   * @param cfg.width  The width of the image, in meters
   * @param cfg.height The height of the image, in meters
   * @param cfg.img    The name of the file to use as the image, or a
   *                   PixiSprite
   * @param cfg.z      An optional z index in the range [-4,4]
   * @param cfg.offset An offset between the component's center and its
   *                   RigidBody's center (optional)
   */
  constructor(cfg: { width: number, height: number, img: string | PixiSprite, z?: ZIndex, offset?: { dx: number, dy: number } }) {
    this.width = cfg.width;
    this.height = cfg.height;
    this.z = cfg.z ? cfg.z : 0;
    if (typeof cfg.img == "string") {
      this._img = cfg.img;
      this.image = stage.imageLibrary.getSprite(this._img);
    }
    else {
      this._img = "";
      this.image = new Sprite("", cfg.img);
    }
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
  }

  /**
   * Render the image
   *
   * @param camera      The camera for the current stage
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor) {
      stage.renderer.addBodyToFrame(this, this.actor.rigidBody, this.image, camera, this.z, location);
    }
  }

  /**
   * Render the image when it does not have a rigidBody. This is only used for
   * Parallax
   *
   * @param anchor      The center x/y at which to draw the image
   * @param camera      The camera for the current stage
   * @param foreground  Does this belong in the foreground (true) or background?
   */
  renderAsParallax(anchor: { cx: number, cy: number }, camera: CameraService, foreground: boolean) {
    stage.renderer.addParallaxToFrame(anchor, this, this.image, camera, foreground);
  }

  /** Perform any custom updates to the image before displaying it */
  prerender() { }

  /**
   * Change the size of the image.  You shouldn't call this directly.  It gets
   * called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", 0 < scale < 1 means "shrink".
   */
  resize(scale: number) {
    this.width *= scale;
    this.height *= scale;
  }

  /**
   * An internal method that lets us overwrite the image used by an ImageSprite
   * with something generated directly by PIXI.  This lets us turn screenshots
   * into ImageSprites.
   *
   * @param pixi_sprite The sprite to use
   */
  overrideImage(pixi_sprite: PixiSprite) { this.image.sprite = pixi_sprite; }
}

/**
 * AnimationSequence describes a set of images that can be cycled through, in
 * order to achieve an animation effect.  We associate a time (in milliseconds)
 * with each image, and also allow the animation to loop.
 */
export class AnimationSequence {
  /**
   * A set of images that can be used as frames of an animation, along with
   * their durations
   */
  public steps: { cell: Sprite, duration: number }[] = [];

  /**
   * Create the shell of an animation.  Once the shell is created, use "to()" to
   * add steps to the animation.
   *
   * @param loop  Should the animation repeat?
   */
  constructor(readonly loop: boolean) { }

  /** Return the duration of the entire animation sequence */
  getDuration() {
    return this.steps.reduce((sum, l) => sum + l.duration, 0);
  }

  /** Make a clone of this animation */
  public clone() {
    let a = new AnimationSequence(this.loop);
    a.steps = this.steps.map(s => ({
      cell: s.cell.imgName !== "" ? stage.imageLibrary.getSprite(s.cell.imgName) : new Sprite("", s.cell.sprite),
      duration: s.duration,
    }));
    return a;
  }

  /**
   * Add a step to an animation
   *
   * @param imgName  The name of the image to add to the animation
   * @param duration The time in milliseconds that this image should be shown
   *
   * @return         The Animation, so that we can chain calls to "to()"
   */
  public to(imgName: string | PixiSprite, duration: number): AnimationSequence {
    if (typeof imgName === "string") {
      this.steps.push({ cell: stage.imageLibrary.getSprite(imgName), duration });
    } else {
      this.steps.push({ cell: new Sprite("", imgName), duration });
    }
    return this;
  }

  /**
   * Create a "simple" animation (i.e., one that shows each of a set of images
   * for the same amount of time)
   *
   * @param cfg.timePerFrame  The time to show each image, in milliseconds
   * @param cfg.repeat        True if the animation should repeat when it
   *                          reaches the end
   * @param cfg.images        The names of the images that comprise the
   *                          animation
   *
   * @return The animation
   */
  static makeSimple(cfg: { timePerFrame: number, repeat: boolean, images: (string | PixiSprite)[] }) {
    let a = new AnimationSequence(cfg.repeat);
    cfg.images.forEach((i) => a.to(i, cfg.timePerFrame));
    return a;
  }
}

/**
 * AnimatedSprite describes any object whose visual representation is an
 * animation.  There can be many types of animations.  The "IDLE_E"
 * (right-facing) animation is the default.  AnimatedSprite can be notified when
 * an Entity's state changes, so that it can switch to the animation associated
 * with the new state.
 */
export class AnimatedSprite implements IStateObserver {
  /** The Actor to which this AnimatedSprite is attached */
  set actor(a: Actor | undefined) {
    this._actor?.state.unregisterObserver(this);
    this._actor = a;
    a?.state.registerObserver(this);
  }

  /** The Actor to which this AnimatedSprite is attached */
  get actor() { return this._actor; }

  /** The Actor to which this AnimatedSprite is attached */
  private _actor?: Actor;

  /** The currently running animation */
  private current_ani: AnimationSequence;

  /** The AnimationState corresponding to the currently running animation */
  private currentState = AnimationState.IDLE_E;

  /**
   * The AnimationState corresponding to the currently running animation, e.g.,
   * for finding out which way the sprite is facing
   */
  public get animationState() { return this.currentState; }

  /** The frame of the currently running animation that is being displayed */
  private activeFrame = 0;

  /** The amount of time for which the current frame has been displayed */
  private elapsedTime = 0;

  /** The amount of time remaining in a throw animation, if one is active */
  private throwRemain = 0;

  /** Width of the animation */
  width: number;

  /** Height of the animation */
  height: number;

  /** Z index of the image */
  z: ZIndex;

  /**
   * The animation sequences to use (they correspond to different
   * AnimationStates) 
   */
  animations: Map<AnimationState, AnimationSequence>;

  /**
   * A function for selecting what animation state to move to when the attached
   * actor's state changes.  Defaults to the version for overhead-style games.
   */
  stateSelector = AnimatedSprite.overheadAnimationTransitions;

  /** An offset between the AnimatedSprite's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Optional callback that runs whenever the active frame changes.  Receives
   * the new frame's 0-based index within the current AnimationSequence, and the
   * AnimationState that sequence corresponds to.
   */
  public onFrameChange?: (index: number, state: AnimationState) => void;

  /**
   * Skip to the `index`th cell of the animation, and move forward within it by
   * `elapsed` milliseconds.  Does nothing (and prints no error) if the index is
   * out of bounds.
   *
   * @param index   The 0-based index of the cell of the animation within the
   *                current AnimationSequence
   * @param elapsed Act as if this many milliseconds within the new cell have
   *                passed.
   */
  public skipTo(index: number, elapsed: number) {
    if (this.current_ani.steps.length > index) {
      this.activeFrame = index;
      this.elapsedTime = elapsed;
      this.onFrameChange?.(this.activeFrame, this.currentState);
    }
  }

  /**
   * Build an animation that can be rendered
   *
   * @param cfg.width      The width of the animation
   * @param cfg.height     The height of the animation
   * @param cfg.animations A map with the valid animations.  Note that you must
   *                       include one for IDLE_E, since that is the default
   *                       animation
   * @param cfg.z          An optional z index in the range [-4,4]
   * @param cfg.remap      A map that indicates when an animation for one state
   *                       should be re-used for another state.
   * @param cfg.offset     An offset between the component's center and its
   *                       RigidBody's center (optional)
   */
  constructor(cfg: { width: number, height: number, animations: Map<AnimationState, AnimationSequence>, z?: ZIndex, remap?: Map<AnimationState, AnimationState>, offset?: { dx: number, dy: number } }) {
    this.width = cfg.width;
    this.height = cfg.height;
    this.z = cfg.z ? cfg.z : 0;

    if (!cfg.animations.has(AnimationState.IDLE_E) && !cfg.remap?.has(AnimationState.IDLE_E))
      stage.console.log("Error: you must always provide an IDLE_E animation");

    // Clone all animations into the map
    this.animations = new Map();
    for (let k of cfg.animations.keys()) {
      let v = cfg.animations.get(k);
      if (v) this.animations.set(k, v.clone())
    }

    // Re-map things that we want to use in more than one place
    cfg.remap?.forEach((v, k) => this.animations.set(k, this.animations.get(v)!));

    this.current_ani = this.animations.get(AnimationState.IDLE_E)!;
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
  }

  /** Restart the current animation */
  public restartCurrentAnimation() {
    this.activeFrame = this.elapsedTime = 0;
    let oldState = this.actor?.state.current.clone();
    this.onStateChange(this.actor!, StateEvent.MOVE_S, oldState!, oldState!);
  }

  /**
   * When an actor renders, we use this method to figure out which image to
   * display
   *
   * @param elapsedMs The time since the last render
   */
  private advanceAnimation(elapsedMs: number) {
    // Advance the time
    this.elapsedTime += elapsedMs;

    // Are we still in this frame?
    if (this.elapsedTime <= this.current_ani.steps[this.activeFrame].duration) return;

    // Are we on the last frame, with no loop? If so, stay where we are
    if (this.activeFrame == this.current_ani.steps.length - 1 && !this.current_ani.loop) return;

    // Advance the animation and reset its timer to zero
    this.activeFrame = (this.activeFrame + 1) % this.current_ani.steps.length;
    this.elapsedTime = 0;
    this.onFrameChange?.(this.activeFrame, this.currentState);
  }

  /** The current image for the active animation */
  public get current() { return this.current_ani.steps[this.activeFrame].cell; }

  /**
   * When the attached Actor's state changes, figure out if the animation needs
   * to change
   *
   * @param _actor    The actor whose state is changing.
   * @param event     The event that might have caused `actor`'s state to change
   * @param newState  The new state of `actor`
   * @param oldState  The old state of `actor`
   */
  onStateChange(_actor: Actor, event: StateEvent, newState: ActorState, oldState: ActorState) {
    // NB: `newState.last_ew` is computed and owned by StateManagerComponent
    // itself (see `changeState`), so sideViewAnimationTransitions can just
    // read it below.
    let st = this.stateSelector(oldState, newState);
    let newAni = this.animations.get(st);
    // NB:  We need to process TOSS_Y even when the animation doesn't change, or
    //      else we'll never run the code for triggering a TOSS_N, and
    //      newState.tossing will never get cleared.
    if (newAni === this.current_ani && event != StateEvent.TOSS_Y) return;
    if (newAni === undefined) { st = AnimationState.IDLE_E; newAni = this.animations.get(st)!; }
    this.current_ani = newAni;
    this.currentState = st;
    this.activeFrame = 0;
    this.elapsedTime = 0;

    // If it's a toss, then it's our responsibility to figure out when to stop
    // it
    //
    // NB:  We won't get a TOSS_Y during a TOSS_Y, so this timing trick is safe
    if (event == StateEvent.TOSS_Y) this.throwRemain = newAni.getDuration();
  }

  /**
   * Figure out what AnimationState to use, given an ActorState.  This version
   * is designed for top-down style games, where the camera seems to be
   * overhead.
   *
   * NB:  This is the default version, but there's no guarantee that it is very
   *      good.  It is used via stateSelector, which can be overridden.  Or you
   *      could chose to modify it for your game.
   *
   * @param _oldState The state that the actor was in
   * @param newState  The details of the new state the actor is moving to
   */
  static overheadAnimationTransitions(_oldState: ActorState, newState: ActorState) {
    // NB:  Every AnimationState group (IDLE_*, WALK_*, CRAWL_*, ...) lists
    //      its 8 entries in the same order as DIRECTION (N, NE, E, SE, S,
    //      SW, W, NW), so instead of branching on direction, we can just
    //      pick the group's first (N) entry and add the direction as an
    //      offset.
    let base: AnimationState;
    if (newState.crawling) base = newState.moving ? AnimationState.CRAWL_N : AnimationState.CRAWL_IDLE_N;
    else if (newState.invincible) base = newState.moving ? AnimationState.INV_N : AnimationState.INV_IDLE_N;
    else if (newState.jumping) base = newState.moving ? AnimationState.JUMP_N : AnimationState.JUMP_IDLE_N;
    else if (newState.tossing) base = newState.moving ? AnimationState.TOSS_N : AnimationState.TOSS_IDLE_N;
    else if (newState.punching) base = newState.moving ? AnimationState.PUNCH_N : AnimationState.PUNCH_IDLE_N;
    else base = newState.moving ? AnimationState.WALK_N : AnimationState.IDLE_N;
    return (base + newState.direction) as AnimationState;
  }

  /**
   * Figure out what AnimationState to use, given an ActorState.  This version
   * is designed for side-view style games, where the camera seems to be at
   * ground level.
   *
   * NB:  As in overheadAnimationTransitions, this may not be good for your
   *      game, so you can always override it or rewrite it.
   *
   * @param oldState  The state that the actor was in
   * @param newState  The details of the new state the actor is moving to
   *
   * @return The new AnimationState for the actor
   */
  static sideViewAnimationTransitions(oldState: ActorState, newState: ActorState) {
    // Check if we used to be facing westward, so we don't lose animation
    // orientation information on a direct up/down movement.
    let old_west = oldState.last_ew == DIRECTION.W || oldState.direction == DIRECTION.NW || oldState.direction == DIRECTION.W || oldState.direction == DIRECTION.SW;

    // Side-view games only ever show E/W (not the full 8-way DIRECTION), so
    // pick whichever way the actor is (or, for N/S movement, was) facing,
    // then use the same base + DIRECTION-offset trick as
    // overheadAnimationTransitions: DIRECTION.E/DIRECTION.W index into each
    // AnimationState group.
    let dir: DIRECTION;
    if (newState.direction == DIRECTION.N || newState.direction == DIRECTION.S) dir = old_west ? DIRECTION.W : DIRECTION.E;
    else if (newState.direction == DIRECTION.NE || newState.direction == DIRECTION.SE || newState.direction == DIRECTION.E) dir = DIRECTION.E;
    else dir = DIRECTION.W;

    let base: AnimationState;
    if (newState.crawling) base = newState.moving ? AnimationState.CRAWL_N : AnimationState.CRAWL_IDLE_N;
    else if (newState.invincible) base = newState.moving ? AnimationState.INV_N : AnimationState.INV_IDLE_N;
    else if (newState.tossing) base = newState.moving ? AnimationState.TOSS_N : AnimationState.TOSS_IDLE_N;
    else if (newState.jumping) base = newState.moving ? AnimationState.JUMP_N : AnimationState.JUMP_IDLE_N;
    else if (newState.punching) base = newState.moving ? AnimationState.PUNCH_N : AnimationState.PUNCH_IDLE_N;
    else base = newState.moving ? AnimationState.WALK_N : AnimationState.IDLE_N;
    return (base + dir) as AnimationState;
  }

  /**
   * Render the animated image's current cell
   *
   * @param camera      The camera for the current stage
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor)
      stage.renderer.addBodyToFrame(this, this.actor.rigidBody, this.current, camera, this.z, location);
  }

  /**
   * Render the animated image's current cell when it does not have a rigidBody.
   * This is only used for Parallax
   *
   * @param anchor      The center x/y at which to draw the image
   * @param camera      The camera for the current stage
   * @param foreground  Should this go in the foreground (true) or background
   *                    (false)
   */
  renderAsParallax(anchor: { cx: number, cy: number }, camera: CameraService, foreground: boolean) {
    stage.renderer.addParallaxToFrame(anchor, this, this.current, camera, foreground);
  }

  /**
   * Prior to rendering, update the animation state
   *
   * @param elapsedMs The time since the last render
   */
  prerender(elapsedMs: number) {
    // Check if it is time to turn off the throwing animation
    if (this.throwRemain > 0) {
      this.throwRemain -= elapsedMs;
      if (this.throwRemain <= 0) {
        this.throwRemain = 0;
        this._actor!.state.changeState(this._actor!, StateEvent.TOSS_N);
        // TOSS_N will put us in a new animation, so we don't want to
        // advance it
        elapsedMs = 0;
      }
    }

    // Now update the cell of the current animation
    this.advanceAnimation(elapsedMs);
  }

  /**
   * Change the size of the animation.  You shouldn't call this directly.  It
   * gets called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  resize(scale: number) {
    this.width *= scale;
    this.height *= scale;
  }
}

/**
 * VideoSprite describes any object whose visual representation is achieved by
 * playing a video.
 */
export class VideoSprite {
  /** The Actor to which this ImageSprite is attached */
  public actor?: Actor;
  /** The image to display for this actor */
  public sprite: Sprite;
  /** Width of the image */
  width: number;
  /** Height of the image */
  height: number;
  /** Z index of the image */
  z: ZIndex;
  /** The name of the video file */
  src: string;
  /** An offset between the VideoSprite's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Build a VideoSprite
   *
   * @param cfg.width  The width of the image, in meters
   * @param cfg.height The height of the image, in meters
   * @param cfg.vid    The name of the video file to use
   * @param cfg.z      An optional z index in the range [-4,4]
   * @param cfg.offset An offset between the component's center and its
   *                   RigidBody's center (optional)
   */
  constructor(cfg: { width: number, height: number, vid: string, z?: ZIndex, offset?: { dx: number, dy: number } }) {
    this.width = cfg.width;
    this.height = cfg.height;
    this.z = cfg.z ? cfg.z : 0;
    this.src = cfg.vid;
    this.sprite = stage.imageLibrary.getVideo(this.src);
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
  }

  /**
   * Render the video
   *
   * @param camera    The camera for the current stage
   * @param location  Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor)
      stage.renderer.addBodyToFrame(this, this.actor.rigidBody, this.sprite, camera, this.z, location);
  }

  /** Start playing this VideoSprite's video */
  play() {
    (this.sprite.sprite.texture.source.resource as HTMLVideoElement).play();
  }

  /** Pause this VideoSprite's video */
  pause() {
    // NB: currentTime ought to tell how far into playback we've made it
    (this.sprite.sprite.texture.source.resource as HTMLVideoElement).pause();
  }

  /**
   * Code to run when the video playback reaches the end.  Setting this
   * replaces any previously-set handler; only one can be registered at a
   * time.
   */
  public set onEnd(callback: () => void) {
    (this.sprite.sprite.texture.source.resource as HTMLVideoElement).onended = () => callback();
  }

  /** The duration of the video associated with this VideoSprite */
  public get duration() {
    return (this.sprite.sprite.texture.source.resource as HTMLVideoElement).duration;
  }

  /** Restart the video playback from the beginning */
  restart() {
    (this.sprite.sprite.texture.source.resource as HTMLVideoElement).currentTime = 0;
  }

  /**
   * Render the video when it does not have a rigidBody. This is only used for
   * Parallax
   *
   * @param anchor      The center x/y at which to draw the image
   * @param camera      The camera for the current stage
   * @param foreground  Should this go in the foreground (true) or background
   *                    (false)
   */
  renderAsParallax(anchor: { cx: number, cy: number }, camera: CameraService, foreground: boolean) {
    stage.renderer.addParallaxToFrame(anchor, this, this.sprite, camera, foreground);
  }

  /** Perform any custom updates to the video before displaying it */
  prerender() { }

  /**
   * Change the size of the video.  You shouldn't call this directly.  It gets
   * called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  resize(scale: number) {
    this.width *= scale;
    this.height *= scale;
  }
}

/**
 * FilledBox describes any object whose visual representation is a filled box.
 */
export class FilledBox {
  /** The Actor to which this FilledSprite is attached */
  public actor?: Actor;
  /** The low-level graphics object that we pass to the Renderer */
  readonly graphics = new Graphics();
  /** Width of the box */
  width: number;
  /** Height of the box */
  height: number;
  /** Z index of the box */
  z: ZIndex;
  /** Line width */
  public get lineWidth() { return this._lineWidth; }
  /** Line width */
  public set lineWidth(v: number | undefined) { this._lineWidth = v; validateFilledConfig(this); }
  /** Line width */
  private _lineWidth?: number;

  /** Line color */
  public get lineColor() { return this._lineColor; }
  /** Line color */
  public set lineColor(v: string | undefined) { this._lineColor = v; validateFilledConfig(this); }
  /** Line color */
  private _lineColor?: string;
  /** Fill color */
  fillColor: string;
  /** An offset between the FilledBox's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Build a FilledBox
   *
   * @param cfg.width      Width of the box 
   * @param cfg.height     Height of the box 
   * @param cfg.lineWidth  Optional width of the border
   * @param cfg.lineColor  Optional color for the border
   * @param cfg.fillColor  Color to fill the box
   * @param cfg.z          An optional z index in the range [-4,4]
   * @param cfg.offset     An offset between the component's center and its
   *                       RigidBody's center (optional)
   */
  public constructor(cfg: { width: number, height: number, lineWidth?: number, lineColor?: string, fillColor: string, z?: ZIndex, offset?: { dx: number, dy: number } }) {
    this.width = cfg.width;
    this.height = cfg.height;
    this.z = cfg.z ? cfg.z : 0;
    this._lineWidth = cfg.lineWidth;
    this._lineColor = cfg.lineColor;
    this.fillColor = cfg.fillColor;
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
    validateFilledConfig(this);
  }

  /**
   * Render the FilledBox
   *
   * @param camera      The camera for the current stage
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor) {
      stage.renderer.addFilledSpriteToFrame(this, this.actor.rigidBody, this.graphics, camera, this.z, location);
    }
  }

  /** Perform any custom updates to the box before displaying it */
  prerender() { }

  /**
   * Change the size of the box.  You shouldn't call this directly.  It gets
   * called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  resize(scale: number) {
    this.width *= scale;
    this.height *= scale;
  }
}

/**
 * FilledRoundedBox describes any object whose visual representation is a filled
 * box with rounded corners.  These are particularly useful as the background
 * for text messages.
 */
export class FilledRoundedBox {
  /** The Actor to which this FilledSprite is attached */
  public actor?: Actor;
  /** The low-level graphics object that we pass to the Renderer */
  readonly graphics = new Graphics();
  /** Width of the box */
  width: number;
  /** Height of the box */
  height: number;
  /** Radius of the corners */
  radius: number;
  /** Z index of the box */
  z: ZIndex;
  /** Line width */
  public get lineWidth() { return this._lineWidth; }
  /** Line width */
  public set lineWidth(v: number | undefined) { this._lineWidth = v; validateFilledConfig(this); }
  /** Line width */
  private _lineWidth?: number;

  /** Line color */
  public get lineColor() { return this._lineColor; }
  /** Line color */
  public set lineColor(v: string | undefined) { this._lineColor = v; validateFilledConfig(this); }
  /** Line color */
  private _lineColor?: string;
  /** Fill color */
  fillColor: string;
  /** An offset between the FilledRoundedBox's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Build a FilledRoundedBox
   *
   * @param cfg.width      Width of the box 
   * @param cfg.height     Height of the box 
   * @param cfg.radius     Radius of the corners
   * @param cfg.lineWidth  Optional width of the border
   * @param cfg.lineColor  Optional color for the border
   * @param cfg.fillColor  Color to fill the box
   * @param cfg.z          An optional z index in the range [-4,4]
   * @param cfg.offset     An offset between the component's center and its
   *                       RigidBody's center (optional)
   */
  public constructor(cfg: { width: number, height: number, radius: number, lineWidth?: number, lineColor?: string, fillColor: string, z?: ZIndex, offset?: { dx: number, dy: number } }) {
    this.width = cfg.width;
    this.height = cfg.height;
    this.z = cfg.z ? cfg.z : 0;
    this.radius = cfg.radius;
    this._lineWidth = cfg.lineWidth;
    this._lineColor = cfg.lineColor;
    this.fillColor = cfg.fillColor;
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
    validateFilledConfig(this);
  }

  /**
   * Render the FilledRoundedBox
   *
   * @param camera      The camera for the current stage
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor) {
      stage.renderer.addFilledSpriteToFrame(this, this.actor.rigidBody, this.graphics, camera, this.z, location);
    }
  }

  /** Perform any custom updates to the box before displaying it */
  prerender() { }

  /**
   * Change the size of the box.  You shouldn't call this directly.  It gets
   * called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  resize(scale: number) {
    this.width *= scale;
    this.height *= scale;
    this.radius *= scale;
  }
}

/**
 * FilledCircle describes any object whose visual representation is a filled
 * circle.
 */
export class FilledCircle {
  /** The Actor to which this FilledCircle is attached */
  public actor?: Actor;
  /** The low-level graphics object that we pass to the Renderer */
  readonly graphics = new Graphics();
  /** Radius of the circle */
  radius: number;
  /** Width, to simplify some other code */
  width: number;
  /** Height, to simplify some other code */
  height: number;
  /** Z index of the circle: Must be in the range [-4, 4] */
  z: ZIndex;
  /** Line width */
  public get lineWidth() { return this._lineWidth; }
  /** Line width */
  public set lineWidth(v: number | undefined) { this._lineWidth = v; validateFilledConfig(this); }
  /** Line width */
  private _lineWidth?: number;

  /** Line color */
  public get lineColor() { return this._lineColor; }
  /** Line color */
  public set lineColor(v: string | undefined) { this._lineColor = v; validateFilledConfig(this); }
  /** Line color */
  private _lineColor?: string;
  /** Fill color */
  fillColor?: string;
  /** An offset between the FilledCircle's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Build a FilledCircle
   * 
   * @param cfg.radius     Radius of the circle
   * @param cfg.lineWidth  Width of the border
   * @param cfg.lineColor  Color for the border
   * @param cfg.fillColor  Color to fill the circle
   * @param cfg.z          An optional z index in the range [-4,4]
   * @param cfg.offset     An offset between the component's center and its
   *                       RigidBody's center (optional)
   */
  public constructor(cfg: { radius: number, lineWidth?: number, lineColor?: string, fillColor?: string, z?: ZIndex, offset?: { dx: number, dy: number } }) {
    this.radius = cfg.radius;
    this.width = this.height = 2 * this.radius;
    this.z = cfg.z ? cfg.z : 0;
    this._lineWidth = cfg.lineWidth;
    this._lineColor = cfg.lineColor;
    this.fillColor = cfg.fillColor;
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
    validateFilledConfig(this);
  }

  /**
   * Render the FilledCircle
   *
   * @param camera      The camera for the current stage
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor) {
      stage.renderer.addFilledSpriteToFrame(this, this.actor.rigidBody, this.graphics, camera, this.z, location);
    }
  }

  /** Perform any custom updates to the circle before displaying it */
  prerender() { }

  /**
   * Change the size of the circle.  You shouldn't call this directly.  It gets
   * called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  resize(scale: number) {
    this.radius *= scale;
    this.width = 2 * this.radius;
    this.height = 2 * this.radius;
  }
}

/**
 * FilledPolygon describes any object whose visual representation is a filled
 * polygon.
 */
export class FilledPolygon {
  /** The Actor to which this FilledPolygon is attached */
  public actor?: Actor;
  /** The low-level graphics object that we pass to the Renderer */
  readonly graphics = new Graphics();
  /** Z index of the polygon: Must be in the range [-4, 4] */
  z: ZIndex;
  /** Width, to simplify some other code */
  width: number;
  /** Height, to simplify some other code */
  height: number;
  /** Vertices of the polygon */
  vertices: { x: number, y: number }[] = [];
  /** Line width */
  public get lineWidth() { return this._lineWidth; }
  /** Line width */
  public set lineWidth(v: number | undefined) { this._lineWidth = v; validateFilledConfig(this); }
  /** Line width */
  private _lineWidth?: number;

  /** Line color */
  public get lineColor() { return this._lineColor; }
  /** Line color */
  public set lineColor(v: string | undefined) { this._lineColor = v; validateFilledConfig(this); }
  /** Line color */
  private _lineColor?: string;
  /** Fill color */
  fillColor?: string;
  /** An offset between the FilledPolygon's center and the RigidBody's center */
  offset: { dx: number, dy: number };

  /**
   * Build a FilledPolygon
   *
   * @param cfg.vertices   The vertex points, relative to the center.
   * @param cfg.lineWidth  Width of the border
   * @param cfg.lineColor  Color for the border
   * @param cfg.fillColor  Color to fill the box
   * @param cfg.z          An optional z index in the range [-4,4]
   * @param cfg.offset     An offset between the component's center and its
   *                       RigidBody's center (optional)
   */
  constructor(cfg: { vertices: { x: number, y: number }[], lineWidth?: number, lineColor?: string, fillColor?: string, z?: ZIndex, offset?: { dx: number, dy: number } }) {
    for (let v of cfg.vertices)
      this.vertices.push({ x: v.x, y: v.y });
    let minX = this.vertices[0].x;
    let minY = this.vertices[0].y;
    let maxX = minX;
    let maxY = minY;
    for (let v of this.vertices) {
      maxX = Math.max(maxX, v.x)
      maxY = Math.max(maxY, v.y)
      minX = Math.min(minX, v.x)
      minY = Math.min(minY, v.y)
    }
    this.width = (Math.abs(maxX) > Math.abs(minX)) ? 2 * maxX : 2 * minX;
    this.height = (Math.abs(maxY) > Math.abs(minY)) ? 2 * maxY : 2 * minY;
    this.z = cfg.z ? cfg.z : 0;
    this._lineWidth = cfg.lineWidth;
    this._lineColor = cfg.lineColor;
    this.fillColor = cfg.fillColor;
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
    validateFilledConfig(this);
  }

  /**
   * Render the FilledPolygon
   *
   * @param camera      The camera for the current stage
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor)
      stage.renderer.addFilledSpriteToFrame(this, this.actor.rigidBody, this.graphics, camera, this.z, location);
  }

  /** Perform any custom updates to the polygon before displaying it */
  prerender() { }

  /**
   * Change the size of the polygon.  You shouldn't call this directly.  It gets
   * called by Actor.resize().
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  resize(scale: number) {
    // we need to manually scale all the vertices, based on the old verts
    this.vertices = this.vertices.map(point => new b2Vec2(point.x * scale, point.y * scale));
    this.width *= scale;
    this.height *= scale;
  }
}

/**
 * ParticleComponent is an AppearanceComponent that draws a batch of small,
 * short-lived "particles" (for things like impact bursts or torch/thruster
 * effects), all emanating from its Actor's RigidBody.
 */
export class ParticleComponent {
  /** The Actor to which this ParticleComponent is attached */
  public actor?: Actor;

  /** The low-level Pixi object that batches and renders every live particle */
  readonly container: ParticleContainer;

  /**
   * The texture shared by every particle (Pixi requires one texture per
   * ParticleContainer)
   */
  private readonly texture: Texture;

  /** Z index of the whole particle system: Must be in the range [-4, 4] */
  z: ZIndex;

  /** An offset between the emission point and the RigidBody's center */
  offset: { dx: number, dy: number };

  /** The direction (radians, 0 = the anchor's own "forward"/+x) that particles are emitted toward */
  private readonly angle: number;
  /** The total angular spread (radians) around `angle` in which particles are emitted */
  private readonly spread: number;
  /** Range (meters/second) of how fast a particle moves outward */
  private readonly speed: { min: number, max: number };
  /** Range (seconds) of how long a particle lives before disappearing */
  private readonly lifetime: { min: number, max: number };
  /** Range (meters) of how big a particle is */
  private size: { min: number, max: number };

  /**
   * Width is a dummy value.  We can't know how big the system gets, but
   * AppearanceComponent needs a width, so we just use twice the max size as an
   * estimate
   */
  width: number;
  /**
   * Height is a dummy value.  We can't know how big the system gets, but
   * AppearanceComponent needs a height, so we just use twice the max size as an
   * estimate
   */
  height: number;
  /** The colors a particle may be tinted, chosen uniformly at random */
  private readonly colors: (string | number)[];
  /** Should each particle fade to transparent over its lifetime? */
  private readonly fade: boolean;

  /** Is this system continuously emitting particles right now? */
  private emitting = false;
  /** When continuously emitting, how many particles per second? */
  private emitRate = 0;
  /** Fractional particles "owed" to the next `prerender`, so a slow rate still averages out correctly */
  private emitAccumulator = 0;

  /**
   * Bookkeeping for every particle that's currently alive.  Pixi's `Particle`
   * only knows its current x/y/scale/rotation/color -- it has no concept of
   * velocity or lifetime, so we track those ourselves, in parallel.
   */
  private readonly alive: { p: Particle, vx: number, vy: number, ageMs: number, lifeMs: number }[] = [];

  /**
   * Build a ParticleComponent
   *
   * @param cfg.img          Optional image to use for each particle
   *                          (defaults to a plain dot, tinted per-particle)
   * @param cfg.angle        The direction (radians) particles are emitted
   *                          toward, relative to the anchor's own rotation.
   *                          Default 0 ("forward").
   * @param cfg.spread       The total angle (radians) of spread around
   *                          `angle`.  Default 2*PI (all directions).
   * @param cfg.speed        Range (meters/second) of how fast a particle moves outward
   * @param cfg.lifetime     Range (seconds) of how long a particle lives before disappearing
   * @param cfg.size         Range (meters) of how big a particle is
   * @param cfg.colors       Colors to choose from, per-particle (hex numbers or CSS strings)
   * @param cfg.fade         Should particles fade out over their lifetime? (default true)
   * @param cfg.z            An optional z index in the range [-4,4]
   * @param cfg.offset       An offset between the emission point and the RigidBody's center
   */
  constructor(cfg: { img?: string, angle?: number, spread?: number, speed?: { min: number, max: number }, lifetime?: { min: number, max: number }, size?: { min: number, max: number }, colors?: (string | number)[], fade?: boolean, z?: ZIndex, offset?: { dx: number, dy: number } }) {
    this.texture = cfg.img ? stage.imageLibrary.getImageAsTexture(cfg.img) : Texture.WHITE;
    this.container = new ParticleContainer({ dynamicProperties: { position: true, color: true } });
    this.z = cfg.z ? cfg.z : 0;
    this.offset = cfg.offset ?? { dx: 0, dy: 0 };
    this.angle = cfg.angle ?? 0;
    this.spread = cfg.spread ?? 2 * Math.PI;
    this.speed = cfg.speed ?? { min: 1, max: 3 };
    this.lifetime = cfg.lifetime ?? { min: .4, max: .8 };
    this.size = { ...(cfg.size ?? { min: .1, max: .2 }) };
    this.colors = cfg.colors ?? [0xffffff];
    this.fade = cfg.fade ?? true;
    this.width = this.height = 2 * this.size.max;
  }

  /**
   * Change the size (and speed) of future particles, keeping the emission
   * point unchanged.  Particles that are already alive are not affected.
   *
   * @param scale The factor by which to scale. Must be >0.
   */
  resize(scale: number) {
    if (scale <= 0) {
      throw "Error: resize requires a positive, non-zero value";
    }
    this.size.min *= scale;
    this.size.max *= scale;
    this.width *= scale;
    this.height *= scale;
  }

  /** Emit `count` particles all at once, e.g. for an impact or a collection effect */
  public burst(count: number) {
    for (let i = 0; i < count; ++i) this.spawnOne();
  }

  /** Start continuously emitting particles, e.g. for a torch or a thruster */
  public startEmitting(particlesPerSecond: number) {
    this.emitting = true;
    this.emitRate = particlesPerSecond;
  }

  /** Stop continuously emitting particles.  Already-alive particles finish out their lifetimes normally. */
  public stopEmitting() {
    this.emitting = false;
  }

  /** Create one new particle, with randomized velocity/lifetime/size/color within our configured ranges */
  private spawnOne() {
    const angle = (this.angle - this.spread / 2) + stage.random.next() * this.spread;
    const speed = this.speed.min + stage.random.next() * (this.speed.max - this.speed.min);
    const lifeMs = 1000 * (this.lifetime.min + stage.random.next() * (this.lifetime.max - this.lifetime.min));
    const size = this.size.min + stage.random.next() * (this.size.max - this.size.min);
    const color = stage.random.choice(this.colors);
    // Dividing by the texture's own pixel dimensions means `size` means the
    // same thing (meters) whether we're using the default 1x1 dot or a
    // custom image of any resolution
    const scale = size / this.texture.width;
    const p = new Particle({ texture: this.texture, x: 0, y: 0, anchorX: .5, anchorY: .5, scaleX: scale, scaleY: scale, tint: color });
    this.container.addParticle(p);
    this.alive.push({ p, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, ageMs: 0, lifeMs });
  }

  /**
   * Advance every live particle (position, and fade if enabled), remove any
   * that have expired, and spawn new ones if we're continuously emitting
   *
   * @param elapsedMs The time since the last render
   */
  prerender(elapsedMs: number) {
    if (this.emitting) {
      this.emitAccumulator += (elapsedMs / 1000) * this.emitRate;
      while (this.emitAccumulator >= 1) {
        this.spawnOne();
        this.emitAccumulator -= 1;
      }
    }

    const dt = elapsedMs / 1000;
    for (let i = this.alive.length - 1; i >= 0; --i) {
      const a = this.alive[i];
      a.ageMs += elapsedMs;
      if (a.ageMs >= a.lifeMs) {
        this.container.removeParticle(a.p);
        this.alive.splice(i, 1);
        continue;
      }
      a.p.x += a.vx * dt;
      a.p.y += a.vy * dt;
      if (this.fade) a.p.alpha = 1 - a.ageMs / a.lifeMs;
    }
  }

  /**
   * Render the particle system: position and rotate the whole container
   * based on the Actor's RigidBody, exactly the way FilledCircle/ImageSprite
   * position their single Graphics/Sprite.
   *
   * @param camera      The camera for the current stage
   * @param location    Where should this be drawn (WORLD/OVERLAY/HUD)
   */
  render(camera: CameraService, location: SpriteLocation) {
    if (this.actor) {
      stage.renderer.addParticlesToFrame(this, this.actor.rigidBody, camera, this.z, location);
    }
  }
}

/**
 * AppearanceComponent is the type of anything that can be drawn to the screen
 */
export type AppearanceComponent = TextSprite | ImageSprite | AnimatedSprite | VideoSprite | FilledBox | FilledRoundedBox | FilledCircle | FilledPolygon | ParticleComponent;

/**
 * Get the first appearance of type `T` on `actor`.  Throw an error if it can't
 * be found.
 *
 * @param actor The actor whose appearances are being searched
 * @param ctor  The constructor of the appearance type to look for, such as
 *              `AnimatedSprite`
 *
 * @returns The appearance
 */
export function getAppearance<T extends AppearanceComponent>(actor: Actor, ctor: new (...args: any[]) => T): T {
  const found = actor.appearance.find(a => a instanceof ctor) as T | undefined;
  if (!found) throw new Error(`This actor has no ${ctor.name}`);
  return found;
}
