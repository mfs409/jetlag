import { RigidBodyComponent } from "../Components/RigidBody";
import { AppearanceComponent } from "../Components/Appearance";
import { StateManagerComponent } from "../Components/StateManager";
import { SoundEffectComponent } from "../Components/SoundEffect";
import { PassiveBehavior, Behavior, setProperty } from "../Components/Behavior";
import { Scene } from "./Scene";
import { MovementComponent, PassThroughMovement, TiltMovement } from "../Components/Movement";
import { stage } from "../Stage";

/**
 * A monotonically increasing counter, so every Actor gets a unique, orderable
 * id
 */
let nextActorId = 0;

/**
 * GestureHandlers is the means by which a programmer can attach to an Entity
 * code to run in response to each of the gestures that JetLag supports.
 */
export class GestureHandlers {
  /** code to run when this actor is tapped */
  public onTap?: (actor: Actor, worldCoords: { x: number, y: number }) => boolean;
  /** code to run on a pan start event */
  public onPanStart?: (actor: Actor, worldCoords: { x: number, y: number }) => boolean;
  /** code to run on a pan move event */
  public onPanMove?: (actor: Actor, worldCoords: { x: number, y: number }) => boolean;
  /** code to run on a pan stop event */
  public onPanStop?: (actor: Actor, worldCoords: { x: number, y: number }) => boolean;
  /** code to run on a down press event */
  public onTouchDown?: (actor: Actor, worldCoords: { x: number, y: number }) => boolean;
  /** code to run on a release event */
  public onTouchUp?: (actor: Actor, worldCoords: { x: number, y: number }) => boolean;
  /** code to run on a swipe event */
  public onSwipe?: (actor: Actor, point1: { x: number, y: number }, point2: { x: number, y: number }, time: number) => boolean;
  /** code to run when the mouse hovers over the actor */
  public onMouseHover?: (actor: Actor, worldCoords: { x: number, y: number }) => boolean;
  /** code to run when the mouse stops hovering over the actor */
  public onMouseUnHover?: (actor: Actor) => boolean;
}

/**
 * Actor is the main entity of the game.  Pretty much everything on the stage is
 * an actor.
 */
export class Actor {
  /**
   * A unique, creation-order id.  Used to deterministically break ties when
   * two Actors' Behaviors both might react to the same contact: whichever
   * Actor has the lower id is given the first chance to react.
   */
  readonly id = nextActorId++;

  /** Set whether this Actor is visible and able to interact with the world */
  public set enabled(val: boolean) {
    // The world may be in mid-render, so we can't really change anything.
    // Defer handling the change until after the next render.
    this.scene.oneTimeEvents.push(() => { this.rigidBody.body.SetEnabled(val); });
  }

  /** Is this Actor visible and able to interact with the world? */
  public get enabled() { return this.rigidBody.body.IsEnabled(); }

  /**
   * The rules for how this Actor should move.  Reassigning this away from a
   * `TiltMovement` unregisters it from `stage.tilt` first, so a stale
   * registration doesn't keep receiving tilt input for the rest of the level
   * (see `TiltService.removeTiltActor`).
   */
  public set movement(movement: MovementComponent) {
    if (this._movement instanceof TiltMovement) stage.tilt.removeTiltActor(this._movement);
    this._movement = movement;
    this._movement.rigidBody = this.rigidBody;
  }

  /** The rules for how this Actor should move */
  public get movement() { return this._movement; }

  /** The rules for how this Actor should move */
  private _movement: MovementComponent;

  /**
   * A physical context for the Actor.  This is necessary if the Actor will
   * move, participate in collisions, or receive gesture inputs.
   */
  readonly rigidBody: RigidBodyComponent;

  /** A set of functions describing how the Actor should respond to gestures. */
  public gestures: GestureHandlers;

  /** The packet of information describing the audio aspects of this Actor */
  readonly sounds: SoundEffectComponent;

  /**
   * The behaviors that this Actor exhibits within the game.  An Actor can
   * carry more than one -- e.g. a Hero-like actor typically has a
   * PlayerControlBehavior, a JumpBehavior, and a HealthBehavior all at once.
   */
  readonly behaviors: Behavior[];

  /** The visual representation of this Actor within the game */
  readonly appearance: AppearanceComponent[];

  /**
   * A map of state that is specific to this actor.
   *
   * This is used by Behavior components, and also by the programmer.  It is the
   * programmer's responsibility to avoid using string keys that are also used
   * by a Behavior component.
   */
  readonly properties = new Map<string, any>();

  /** The current state of this Actor */
  readonly state = new StateManagerComponent();

  /** The scene where the Actor exists */
  public scene: Scene;

  /** Code to run when the actor disappears */
  readonly onDisappear: undefined | ((a: Actor) => void);

  /**
   * Create an Actor
   *
   * @param config.rigidBody    The actor's body
   * @param config.appearance   The appearance of the actor
   * @param config.movement     The movement rules for this actor
   * @param config.behaviors    The behavior(s) for this actor
   * @param config.gestures     Any gestures to attach to this actor
   * @param config.sounds       The sounds for this actor
   * @param config.onDisappear  Code to run when the actor disappears
   * @param config.properties   Additional named properties to merge into
   *                            `actor.properties` after every Behavior has had
   *                            a chance to set its own via `attach()`. Throws
   *                            if a key here collides with one a Behavior
   *                            already claimed.
   */
  public constructor(config: { rigidBody: RigidBodyComponent, appearance: AppearanceComponent | AppearanceComponent[], movement?: MovementComponent, behaviors?: Behavior | Behavior[], gestures?: GestureHandlers, sounds?: SoundEffectComponent, onDisappear?: (a: Actor) => void, properties?: Map<string, any> }) {
    this.scene = config.rigidBody.scene;

    let appearance = [] as AppearanceComponent[];
    if (Array.isArray(config.appearance)) {
      config.appearance.forEach(a => appearance.push(a));
    } else {
      appearance.push(config.appearance);
    }
    if (appearance.length == 0) {
      throw "Error: config.appearance cannot be an empty array";
    }

    this.appearance = appearance;
    this.scene.camera.addActor(this);
    this.appearance.forEach(a => a.actor = this);

    this.rigidBody = config.rigidBody;
    this.rigidBody.body.SetUserData(this);

    this._movement = config.movement ?? new PassThroughMovement();
    this._movement.rigidBody = this.rigidBody;

    let behaviors = [] as Behavior[];
    if (config.behaviors === undefined) {
      behaviors.push(new PassiveBehavior());
    } else if (Array.isArray(config.behaviors)) {
      config.behaviors.forEach(b => behaviors.push(b));
    } else {
      behaviors.push(config.behaviors);
    }
    this.behaviors = behaviors;
    this.behaviors.forEach(b => b.actor = this);
    this.behaviors.forEach(b => b.attach(this));
    for (const [key, value] of config.properties ?? []) setProperty(this, key, value);

    if (config.gestures) {
      this.gestures = config.gestures;
    } else {
      this.gestures = {};
    }

    this.sounds = config.sounds ?? new SoundEffectComponent({});
    this.onDisappear = config.onDisappear;
  }

  /**
   * Prerender is called on an Actor immediately before it is rendered.  This
   * lets us do any last-minute adjustments before putting it on the screen.
   *
   * @param elapsedMs The time since the last render
   *
   * @returns True if the Actor is enabled, false otherwise
   */
  public prerender(elapsedMs: number) {
    if (!this.enabled) return false;
    this.movement.prerender(elapsedMs, this.scene.camera);
    this.rigidBody.prerender(elapsedMs, this);
    this.behaviors.forEach(b => b.prerender(elapsedMs));
    this.appearance.forEach(a => a.prerender(elapsedMs));
    return true;
  }

  /** Make an Actor disappear */
  public remove() {
    // Set it invisible, so that future calls know to ignore this Actor.  This
    // also disables the rigidBody.
    //
    // NB: We disable instead of actually removing from the physics world
    //
    // NB: The world may be in mid-render, so we can't really change anything.
    //     Defer handling the event until after the next render.
    this.scene.oneTimeEvents.push(() => {
      // NB: SetEnabled is a body-level operation, so this disables every
      //     fixture on the body at once -- including a proximityFixture, if
      //     there is one -- with no fixture-specific handling needed.
      this.rigidBody.body.SetEnabled(false);
      if (this._movement instanceof TiltMovement) stage.tilt.removeTiltActor(this._movement);

      // play a sound when we remove this Actor?
      this.sounds?.play("disappear");

      if (this.onDisappear) this.onDisappear(this);
    });
  }

  /**
   * Change the size of an Actor, keeping its center unchanged
   *
   * @param scale The factor by which to scale the actor's dimensions.  Must be
   *              >0.  1 means no change, a fraction means shrink, and a number
   *              >1 means grow.
   */
  public resize(scale: number) {
    if (scale <= 0) {
      throw "Error: resize requires a positive, non-zero value";
    }
    // set new height and width of the AppearanceComponents
    this.appearance.forEach(a => a.resize(scale));
    this.rigidBody.resize(scale);
  }
}
