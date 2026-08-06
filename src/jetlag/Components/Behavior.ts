import { b2Transform, b2BodyType } from "@box2d/core";
import { Actor } from "../Entities/Actor";
import { stage } from "../Stage";
import { DIRECTION, StateEvent } from "./StateManager";
import { AnimatedSprite } from "./Appearance";
import { tossAt, tossFixedDir } from "./Movement";
import { TimedEvent } from "../Services/Timer";

/**
 * The different reasons why two entities might pass through each other, even
 * when they collide with everything else
 *
 * Each Behavior puts one of these in its `collisionRules.properties`, then puts
 * some values in `collisionRules.ignores`. Two actors physically pass through
 * each other if either one has a behavior whose `ignores` contains a value
 * present in one of the other's behaviors' `properties`.
 *
 * NB: When *everything* is supposed to pass over something, we favor Box2D
 * mechanisms instead of collisionRules for disabling collisions.
 */
export enum CollisionExemptions {
  /** A "crawling" actor */
  CRAWL = 0,
  /** A "jumping" actor */
  JUMP = 1,
  /** A goal or destination */
  GOAL = 2,
  /** Something that gets collected */
  COLLECTABLE = 3,
  /** Something that gets moved by the player */
  PLAYER_CONTROL = 4,
  /** A thing that gets thrown */
  THROWABLE = 5,
  /** Something that can do harm to other actors */
  HAZARD = 6,
  /** The inverse of the default: everything passes over it */
  TRIGGER = 7,
  /** The default: nothing passes over it */
  SOLID = 8,
  /** The actor is really just a decoration, not a physical object */
  PASSIVE = 9,
}

/**
 * Report the cardinal direction that one must travel from the center of `self`
 * in order to reach `other`. Specializing collision behavior based on this
 * direction allows things like "defeat by jumping" to work when falling onto an
 * actor, but not when jumping up into it.
 *
 * The raw center-to-center offset is normalized by each axis's combined
 * half-extents before comparing them. Without this, a platform that's much
 * wider than it is tall (a typical one-way platform) would misclassify an
 * off-center landing as "E"/"W" instead of "N", since the raw horizontal
 * offset so easily exceeds the raw vertical one.
 *
 * @param self  The actor whose side is being classified
 * @param other The actor touching `self`, whose position determines the zone
 */
export function relativeZone(self: Actor, other: Actor): DIRECTION {
  const sc = self.rigidBody.getCenter(), oc = other.rigidBody.getCenter();
  const dx = oc.x - sc.x, dy = oc.y - sc.y;
  const halfWidth = (self.rigidBody.w + other.rigidBody.w) / 2;
  const halfHeight = (self.rigidBody.h + other.rigidBody.h) / 2;
  const nx = halfWidth > 0 ? dx / halfWidth : dx;
  const ny = halfHeight > 0 ? dy / halfHeight : dy;
  if (Math.abs(nx) > Math.abs(ny)) return nx >= 0 ? DIRECTION.E : DIRECTION.W;
  // NB: remember that Y increases downward
  return ny >= 0 ? DIRECTION.S : DIRECTION.N;
}

/**
 * Find the first Behavior of type `T` on `actor`, if any
 *
 * @param actor The actor whose behaviors are being searched
 * @param ctor  The constructor of the Behavior type to look for
 */
export function findBehavior<T extends Behavior>(actor: Actor, ctor: new (...args: any[]) => T) {
  return actor.behaviors.find(b => b instanceof ctor) as T | undefined;
}

/**
 * Set `actor.properties[key]` for the first time.  Each key is owned by the
 * Behavior that first sets it (or, for keys not claimed by any Behavior, by the
 * Actor's own `properties` constructor argument, which is merged in last).
 * Setting twice is an error.
 *
 * @param actor The actor whose property is being set
 * @param key   The property's key (by convention, a Behavior's own static key
 *              constant, e.g. `HealthBehavior.HIT_POINTS`)
 * @param value The property's initial value
 */
export function setProperty(actor: Actor, key: string, value: any) {
  if (actor.properties.has(key)) {
    throw new Error(`Actor property "${key}" was already set; cannot override it`);
  }
  actor.properties.set(key, value);
}

/**
 * Update an already-set `actor.properties[key]`.  This is for a Behavior
 * changing its own property's value over time, so it throws if the key was
 * never set.
 *
 * @param actor The actor whose property is being updated
 * @param key   The property's key (must already be set, via `setProperty`)
 * @param value The property's new value
 */
export function updateProperty(actor: Actor, key: string, value: any) {
  if (!actor.properties.has(key)) {
    throw new Error(`Actor property "${key}" was never set; cannot update it`);
  }
  actor.properties.set(key, value);
}

/**
 * Read `actor.properties[key]`, throwing if it was never set (instead of
 * returning `undefined`)
 *
 * @param actor The actor whose property is being read
 * @param key   The property's key
 */
export function getProperty<T>(actor: Actor, key: string): T {
  if (!actor.properties.has(key)) {
    throw new Error(`Actor property "${key}" was never set`);
  }
  return actor.properties.get(key) as T;
}

/**
 * Give every Behavior on `self` a chance to react to touching `other`, in
 * attachment order, stopping as soon as one claims the contact (returns
 * true)
 *
 * @returns true if some Behavior on `self` claimed the contact
 */
export function dispatchCollision(self: Actor, other: Actor) {
  return self.behaviors.some(b => b.onCollide(self, other));
}

/**
 * The default eligibility check most interaction Behaviors use: "did a
 * player-controlled actor do this?"
 *
 * @param other The actor to check
 */
function defaultPlayerOnly(other: Actor) {
  return other.behaviors.some(b => b instanceof PlayerControlBehavior);
}

/**
 * Behavior is the base class for everything an Actor can do or react to.  An
 * Actor can carry more than one Behavior at once.
 */
export abstract class Behavior {
  /** The actor associated with this Behavior */
  protected _actor?: Actor;

  /** The actor associated with this Behavior */
  public set actor(actor: Actor | undefined) { this._actor = actor; }

  /** The actor associated with this Behavior */
  public get actor() { return this._actor; }

  /**
   * Which "team" this Behavior belongs to.  A team is just a number, and for
   * the most part it's only when user code consults teams that teams have
   * meaning.  The only exception is that HazardBehavior uses `team` to prevent
   * team attack damage.
   */
  public team = 0;

  /**
   * Construct a Behavior.  Every subclass's constructor should call
   * `super(cfg)` (passing its own `cfg`, even though it has other fields
   * too) instead of repeating `this.team = cfg.team ?? 0` itself.
   *
   * @param cfg.team The team this actor belongs to (default 0)
   */
  constructor(cfg: { team?: number } = {}) {
    this.team = cfg.team ?? 0;
  }

  /** Tasks to run before every render */
  readonly prerenderTasks: ((elapsedMs: number, actor?: Actor) => void)[] = [];

  /**
   * Attach the behavior to an actor.  This is called internally, once per
   * behavior.  It lets a Behavior customize parts of the actor (such as its
   * rigid body and properties).
   */
  attach(_actor: Actor): void { }

  /**
   * collisionRules lets us turn off Box2D collisions based on the Behaviors of
   * two actors.  See `CollisionExemptions` for the semantics.
   */
  collisionRules = {
    /** The first set: properties associated with this Behavior */
    properties: [] as CollisionExemptions[],

    /**
     * The second set: properties of other actors that this Behavior won't
     * collide with
     */
    ignores: [] as CollisionExemptions[]
  }

  /**
   * Indicate that this Behavior should not ignore collisions with some other
   * property
   */
  public enableCollision(which: CollisionExemptions) {
    this.collisionRules.ignores = this.collisionRules.ignores.filter(value => value != which);
  }

  /**
   * Indicate that this Behavior should ignore collisions with some other
   * property
   */
  public disableCollision(which: CollisionExemptions) {
    this.collisionRules.ignores.push(which);
  }

  /**
   * Code to run when there is a collision between this Behavior's Actor
   * (`self`) and `other`.
   *
   * @returns true if the collision led to meaningful game state change.  Doing
   *          so stops any remaining Behaviors on `self` from also reacting to
   *          the collision.
   */
  onCollide(_self: Actor, _other: Actor) { return false; }

  /** Code to run immediately before rendering this Behavior's Actor */
  prerender(elapsedMs: number) {
    this.prerenderTasks.forEach(task => task(elapsedMs, this._actor));
  }

  /**
   * If `actor`'s body isn't dynamic, warn and upgrade it to dynamic.  Used
   * by every Behavior whose whole point requires a dynamic body (e.g.
   * `setVelocity`/forces actually doing something).
   *
   * @param actor        The actor being attached (may be undefined, if this
   *                     Behavior is being detached)
   * @param behaviorName The name to use in the warning message
   */
  protected requireDynamicBody(actor: Actor | undefined, behaviorName: string) {
    if (actor && actor.rigidBody.body.GetType() !== b2BodyType.b2_dynamicBody) {
      stage.console.log(`Warning: You have attached a ${behaviorName} to an actor whose body is not dynamic.  Switching to dynamic.\n ${Error().stack}`);
      actor.rigidBody.body.SetType(b2BodyType.b2_dynamicBody);
    }
  }

  /**
   * Turn off physical collisions for `actor`.  Used by Behaviors that are only
   * ever passed through, not physically collided with, like coins.
   *
   * @param actor The actor being attached (may be undefined, if this Behavior
   *              is being detached)
   */
  protected disableCollisions(actor: Actor | undefined) {
    if (actor) actor.rigidBody.collisionsEnabled = false;
  }
}

/**
 * PlayerControlBehavior marks an Actor as "the player" (or "one of the
 * players").  It's purely a convenience: many games are defined in terms of how
 * one central "player" interacts with a variety of other things.  Marking an
 * actor with this behavior lets all of those other things use their default
 * rules to know how to interact with "the player".
 */
export class PlayerControlBehavior extends Behavior {
  /** The actor associated with this Behavior */
  public set actor(actor: Actor | undefined) {
    this._actor = actor;
    this.requireDynamicBody(actor, "PlayerControlBehavior");
  }

  /** The actor associated with this Behavior */
  public get actor() { return this._actor; }

  /**
   * Construct a PlayerControlBehavior
   *
   * @param cfg.team The team this actor belongs to (default 0)
   */
  constructor(cfg: { team?: number } = {}) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.PLAYER_CONTROL);
  }
}

/**
 * JumpBehavior grants an actor the ability to jump.  Jumping is not just
 * "moving upward", because:
 * - It gets a special animation state
 * - It can be capped (double-jump before touching ground)
 * - It is a special state for causing damage to other actors
 */
export class JumpBehavior extends Behavior {
  /** The actor associated with this Behavior */
  public set actor(actor: Actor | undefined) {
    this._actor = actor;
    this.requireDynamicBody(actor, "JumpBehavior");
  }

  /** The actor associated with this Behavior */
  public get actor() { return this._actor; }

  /** Indicate that the actor can jump infinitely often while in the air */
  private allowMultiJump: boolean;

  /** Allow the actor to do > 1 but not infinite jumps while in the air */
  private numJumpsAllowed: number;

  /** The `actor.properties` key for how many jumps have been made since the actor was last on the ground */
  static readonly CURR_JUMPS = "currJumps";

  /**
   * Construct a JumpBehavior
   *
   * @param cfg.allowMultiJump  True if the actor can jump infinitely often
   *                            while airborne
   * @param cfg.numJumpsAllowed Use 2 to enable double-jumps, etc.
   * @param cfg.team            The team this actor belongs to (default 0)
   */
  constructor(cfg: { allowMultiJump?: boolean, numJumpsAllowed?: number, team?: number } = {}) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.JUMP);
    this.allowMultiJump = !!cfg.allowMultiJump;
    this.numJumpsAllowed = Math.max(1, cfg.numJumpsAllowed ?? 1);
  }

  /** Initializes this actor's jump count to 0 */
  attach(actor: Actor) { setProperty(actor, JumpBehavior.CURR_JUMPS, 0); }

  /** Make the actor jump, unless it is in the air and out of jumps */
  public jump(x: number, y: number) {
    if (!this._actor) return;
    let currJumps = getProperty<number>(this._actor, JumpBehavior.CURR_JUMPS);
    if (!this.allowMultiJump && currJumps >= this.numJumpsAllowed) return;
    updateProperty(this._actor, JumpBehavior.CURR_JUMPS, currJumps + 1);

    let v = this._actor.rigidBody.body.GetLinearVelocity();
    // NB: setVelocity() breaks any existing sticky joint first (or it would
    // just yank the actor back to where it was) and starts the sticky
    // entity's re-stick cooldown, so the actor can actually get away.
    this._actor.rigidBody.setVelocity(x + v.x, y + v.y);

    this._actor.state.changeState(this._actor, StateEvent.JUMP_Y);
    this._actor.sounds?.play("jump");
  }

  /**
   * Called (typically by a SolidBehavior this actor lands on) to indicate
   * the actor is back on solid ground and can jump again.
   */
  public resetJumps() {
    if (!this._actor) return;
    if (this._actor.state.current.jumping) {
      this._actor.state.changeState(this._actor, StateEvent.JUMP_N);
    }
    updateProperty(this._actor, JumpBehavior.CURR_JUMPS, 0);
  }
}

/**
 * CrawlBehavior grants an actor the ability to crawl.  This involves a few
 * things:
 * - Changing rotation to fit in a small space
 * - A special animation state
 * - A special state for causing damage to other actors
 */
export class CrawlBehavior extends Behavior {
  /**
   * Construct a CrawlBehavior
   *
   * @param cfg.team The team this actor belongs to (default 0)
   */
  constructor(cfg: { team?: number } = {}) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.CRAWL);
  }

  /**
   * Put the actor in crawl mode.
   *
   * @param rotate The amount to rotate the actor when the crawl starts
   */
  public crawlOn(rotate: number) {
    if (!this._actor || !this._actor.rigidBody) return;
    if (this._actor.state.current.crawling) return;
    let body = this._actor.rigidBody.body;
    let transform = new b2Transform();
    transform.SetPositionAngle(body.GetPosition(), body.GetAngle() + rotate);
    body.SetTransform(transform);
    this._actor.state.changeState(this._actor, StateEvent.CRAWL_Y);
  }

  /**
   * Take the actor out of crawl mode
   *
   * @param rotate The amount to rotate the actor when the crawl ends
   */
  public crawlOff(rotate: number) {
    if (!this._actor || !this._actor.rigidBody) return;
    if (!this._actor.state.current.crawling) return;
    let body = this._actor.rigidBody.body;
    let transform = new b2Transform();
    transform.SetPositionAngle(body.GetPosition(), body.GetAngle() - rotate);
    body.SetTransform(transform);
    this._actor.state.changeState(this._actor, StateEvent.CRAWL_N);
  }
}

/**
 * HealthBehavior tracks hit points for anything that can be hurt / defeated.
 * It also provides invincibility.
 */
export class HealthBehavior extends Behavior {
  /** The `actor.properties` key for remaining hit points */
  static readonly HIT_POINTS = "hitPoints";

  /** The `actor.properties` key for remaining invincibility time, in milliseconds */
  static readonly INVINCIBLE_REMAINING_MS = "invincibleRemainingMs";

  /** Remaining hit points */
  public get hitPoints() { return getProperty<number>(this._actor!, HealthBehavior.HIT_POINTS); }

  /** Setting this fires `onHitPointsChange` (if provided) when the value actually changes */
  public set hitPoints(amount: number) {
    let old = this.hitPoints;
    updateProperty(this._actor!, HealthBehavior.HIT_POINTS, amount);
    if (old != amount && this.onHitPointsChange) this.onHitPointsChange(this._actor!);
  }

  /** Code to run when this actor's hit points change */
  public onHitPointsChange?: (a: Actor) => void;

  /** Time (seconds) until invincibility runs out */
  public get invincibleRemaining() {
    return Math.max(0, getProperty<number>(this._actor!, HealthBehavior.INVINCIBLE_REMAINING_MS) / 1000);
  }

  /**
   * Setting a positive value fires an `INV_Y` state-change event, so an
   * `AnimatedSprite` observing this actor can switch to an invincibility
   * animation.  Setting it back to 0 (e.g. to cancel invincibility early,
   * rather than letting it decay naturally) fires `INV_N`, so that animation is
   * cleared.
   */
  public set invincibleRemaining(amountSeconds: number) {
    const wasInvincible = this.invincibleRemaining > 0;
    updateProperty(this._actor!, HealthBehavior.INVINCIBLE_REMAINING_MS, amountSeconds * 1000);
    if (amountSeconds > 0) this._actor!.state.changeState(this._actor!, StateEvent.INV_Y);
    else if (wasInvincible) this._actor!.state.changeState(this._actor!, StateEvent.INV_N);
  }

  /** Code to run when this actor's health drops to 0 and it is defeated */
  public onDefeated?: (a: Actor, defeatedBy?: Actor) => void;

  /**
   * The starting hit points, captured at construction time and written into
   * `actor.properties` by `attach()` */
  private initialHitPoints: number;

  /**
   * Construct a HealthBehavior
   *
   * @param cfg.hitPoints         Starting hit points (default 1)
   * @param cfg.onHitPointsChange Code to run on any change to hit points
   * @param cfg.onDefeated        Code to run when this actor is defeated
   * @param cfg.team              The team this actor belongs to (default 0)
   */
  constructor(cfg: { hitPoints?: number, onHitPointsChange?: (a: Actor) => void, onDefeated?: (a: Actor, defeatedBy?: Actor) => void, team?: number } = {}) {
    super(cfg);
    this.initialHitPoints = cfg.hitPoints ?? 1;
    this.onHitPointsChange = cfg.onHitPointsChange;
    this.onDefeated = cfg.onDefeated;
  }

  /** Initializes this actor's hit points and invincibility properties, and registers the invincibility-decay prerender task */
  attach(actor: Actor) {
    setProperty(actor, HealthBehavior.HIT_POINTS, this.initialHitPoints);
    setProperty(actor, HealthBehavior.INVINCIBLE_REMAINING_MS, 0);

    // Decay invincibility over time, firing INV_N once it reaches 0
    this.prerenderTasks.push((elapsedMs: number) => {
      const remaining = getProperty<number>(actor, HealthBehavior.INVINCIBLE_REMAINING_MS);
      if (remaining > 0) {
        const next = remaining - elapsedMs;
        updateProperty(actor, HealthBehavior.INVINCIBLE_REMAINING_MS, Math.max(0, next));
        if (next <= 0) actor.state.changeState(actor, StateEvent.INV_N);
      }
    });
  }

  /**
   * Apply damage.  While invincible, damage is ignored (unless
   * `ignoreInvincibility` is set).  If hit points drop to 0 or below, the
   * actor is defeated (removed, and `onDefeated` runs).
   *
   * @param amount              How much damage to apply
   * @param defeatedBy          The actor responsible for the damage, if any
   * @param ignoreInvincibility Apply the damage even if the actor is currently
   *                            invincible
   */
  public damage(amount: number, defeatedBy?: Actor, ignoreInvincibility = false) {
    if (!ignoreInvincibility && this.invincibleRemaining > 0) return;
    this.hitPoints -= amount;
    if (this.hitPoints <= 0) {
      if (this.onDefeated) this.onDefeated(this._actor!, defeatedBy);
      this._actor!.remove();
    }
  }
}

/**
 * CollectableBehavior is most easily thought of as a coin.  When an eligible
 * actor collides with it, it usually disappears, and some counter gets updated.
 */
export class CollectableBehavior extends Behavior {
  /** The actor associated with this Behavior */
  public set actor(actor: Actor | undefined) {
    this._actor = actor;
    this.disableCollisions(actor);
  }

  /** The actor associated with this Behavior */
  public get actor() { return this._actor; }

  /**
   * The code to run when an eligible actor collects this, or the name of a
   * score counter to increment by one.
   */
  onCollect: ((g: Actor, collector: Actor) => boolean) | string;

  /**
   * Which actors are allowed to collect this?  Defaults to player-controlled
   * actors only.
   */
  public eligible: (other: Actor) => boolean;

  /**
   * Construct a CollectableBehavior
   *
   * @param cfg.onCollect Code to run when an eligible actor collects this,
   *                      or the name of a score counter to increment by one
   * @param cfg.eligible  Which actors can collect this (default: only
   *                      player-controlled actors)
   * @param cfg.team      The team this actor belongs to (default 0)
   */
  constructor(cfg: { onCollect: ((g: Actor, collector: Actor) => boolean) | string, eligible?: (other: Actor) => boolean, team?: number }) {
    super(cfg);

    this.collisionRules.properties.push(CollisionExemptions.COLLECTABLE);
    this.disableCollision(CollisionExemptions.COLLECTABLE);

    this.onCollect = cfg.onCollect;
    this.eligible = cfg.eligible ?? defaultPlayerOnly;
  }

  /** Collect this if `other` is eligible; removes it unless `onCollect` returns false */
  onCollide(self: Actor, other: Actor) {
    if (!this.eligible(other)) return false;
    if (typeof this.onCollect === "string") {
      stage.score.counters.add(this.onCollect, 1);
      self.remove();
    } else if (this.onCollect(self, other)) {
      self.remove();
    }
    return true;
  }
}

/**
 * GoalBehavior is most easily thought of in the context of a maze game: an
 * eligible actor that arrives (and, for the common case, just increments a
 * named score counter -- e.g. `stage.score.addWinCondition(() =>
 * stage.score.counters.get("destinationArrivals") >= 1)`) or runs custom
 * logic to decide whether to accept the arrival.
 */
export class GoalBehavior extends Behavior {
  /** The `actor.properties` key for how many actors are currently held */
  static readonly HOLDING = "holding";

  /** How many actors this Goal can hold */
  private capacity: number;

  /**
   * Decide whether to accept an arriving actor, or the name of a score counter
   * to increment by one on every accepted arrival.  As a function, return
   * `true` to accept the arrival (removing the arriving actor) or `false` to
   * reject it (leaving both actors as they are).  Note that the function
   * doesn't auto-increment a counter.
   */
  public onArrival: ((h: Actor) => boolean) | string;

  /** Which actors are allowed to arrive here?  Defaults to player-controlled actors only. */
  public eligible: (other: Actor) => boolean;

  /**
   * Construct a GoalBehavior
   *
   * @param cfg.capacity  How many actors this Goal can hold (default 1)
   * @param cfg.onArrival Decide whether to accept an arriving actor, or the
   *                      name of a score counter to increment by one on every
   *                      accepted arrival
   * @param cfg.eligible  Which actors can arrive here (default: only
   *                      player-controlled actors)
   * @param cfg.team      The team this actor belongs to (default 0)
   */
  constructor(cfg: { capacity?: number, onArrival: ((h: Actor) => boolean) | string, eligible?: (other: Actor) => boolean, team?: number }) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.GOAL);
    this.capacity = cfg.capacity ?? 1;
    this.onArrival = cfg.onArrival;
    this.eligible = cfg.eligible ?? defaultPlayerOnly;
  }

  /** Initializes this Goal's "how many actors are currently held" property to 0 */
  attach(actor: Actor) { setProperty(actor, GoalBehavior.HOLDING, 0); }

  /** Accept `other` if it's eligible, there's remaining capacity, and `onArrival` allows it; removes `other` on acceptance */
  onCollide(self: Actor, other: Actor) {
    if (!this.eligible(other)) return false;
    const holding = getProperty<number>(self, GoalBehavior.HOLDING);
    if (holding >= this.capacity) return true;
    if (typeof this.onArrival === "string") {
      stage.score.counters.add(this.onArrival, 1);
    } else if (!this.onArrival(other)) {
      return true;
    }
    self.sounds?.play("arrive");
    updateProperty(self, GoalBehavior.HOLDING, holding + 1);
    other.remove();
    return true;
  }
}

/**
 * HazardBehavior describes something to be avoided or defeated.
 *
 * Every HazardBehavior increments the `HazardBehavior.ENEMIES_CREATED` counter
 * when constructed and `HazardBehavior.ENEMIES_DEFEATED` when defeated, so a
 * win condition like "defeat them all" is just
 * `stage.score.addWinCondition(() =>
 * stage.score.counters.get(HazardBehavior.ENEMIES_DEFEATED) >=
 * stage.score.counters.get(HazardBehavior.ENEMIES_CREATED))`.
 */
export class HazardBehavior extends Behavior {
  /** The `stage.score.counters` key for how many HazardBehaviors have ever been constructed */
  static readonly ENEMIES_CREATED = "enemiesCreated";

  /** The `stage.score.counters` key for how many HazardBehaviors have been defeated */
  static readonly ENEMIES_DEFEATED = "enemiesDefeated";

  /**
   * Flat damage dealt for a contact that doesn't defeat this hazard (the
   * default `onContact`'s outcome)
   */
  public damage: number;

  /**
   * Decide the outcome of a contact, given which zone it came from (see
   * `relativeZone`).  Negative defeats this actor, positive damages the other
   * actor by that amount, zero does nothing.
   */
  public onContact: (zone: DIRECTION) => number;

  /**
   * Does this hazard always defeat whatever it touches, regardless of geometry
   * or invincibility?
   */
  public instantDefeat: boolean;

  /**
   * When the other actor is invincible, does this hazard survive the contact
   * anyway?
   */
  public immuneToInvincibility: boolean;

  /**
   * Which actors is this hazard even capable of hurting?  Defaults to
   * player-controlled actors only
   */
  public eligible: (other: Actor) => boolean;

  /** Code to run when this hazard is defeated */
  public onDefeated?: (self: Actor, defeatedBy?: Actor) => void;

  /**
   * Construct a HazardBehavior
   *
   * @param cfg.damage                Flat damage dealt for a contact that
   *                                  doesn't defeat this hazard (default 2,
   *                                  so that a hazard with no `onContact`
   *                                  configured defeats a default-strength
   *                                  actor without itself disappearing --
   *                                  matching the old Enemy default)
   * @param cfg.onContact             Decide the outcome of a contact from a
   *                                  given zone (default: always deal `damage`)
   * @param cfg.instantDefeat         Should this hazard always defeat
   *                                  whatever it touches?
   * @param cfg.immuneToInvincibility Does invincibility defeat this hazard?
   * @param cfg.eligible              Which actors can this hazard affect
   *                                  (default: only player-controlled actors)
   * @param cfg.onDefeated            Code to run when this hazard is defeated
   * @param cfg.team                  The team this actor belongs to (default 0)
   */
  constructor(cfg: { damage?: number, onContact?: (zone: DIRECTION) => number, instantDefeat?: boolean, immuneToInvincibility?: boolean, eligible?: (other: Actor) => boolean, onDefeated?: (self: Actor, defeatedBy?: Actor) => void, team?: number } = {}) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.HAZARD);
    this.disableCollision(CollisionExemptions.COLLECTABLE);
    this.disableCollision(CollisionExemptions.GOAL);

    this.damage = cfg.damage ?? 2;
    this.onContact = cfg.onContact ?? (() => this.damage);
    this.instantDefeat = !!cfg.instantDefeat;
    this.immuneToInvincibility = !!cfg.immuneToInvincibility;
    this.eligible = cfg.eligible ?? defaultPlayerOnly;
    this.onDefeated = cfg.onDefeated;

    stage.score.counters.add(HazardBehavior.ENEMIES_CREATED, 1);
  }

  /**
   * If this hazard's actor also has a `HealthBehavior`, chain onto its
   * `onDefeated` (preserving whatever the caller already set) so that
   * `announceDefeat` still runs when it's the `HealthBehavior`, not this
   * hazard's own hit points, that reaches 0.  A hazard with no
   * `HealthBehavior` has no hit points of its own at all -- `takeDamage`
   * defeats it outright, regardless of `amount`.
   *
   * @param actor The actor this HazardBehavior is attached to
   */
  attach(actor: Actor) {
    const health = findBehavior(actor, HealthBehavior);
    if (health) {
      const existing = health.onDefeated;
      health.onDefeated = (a, b) => {
        if (existing) existing(a, b);
        // NB: don't remove `a` here -- HealthBehavior.damage() already does
        // that itself, right after this callback returns.
        this.announceDefeat(b);
      };
    }
  }

  /**
   * This hazard takes `amount` damage (e.g. from a ThrowableBehavior).  If
   * its actor has a `HealthBehavior`, this is just `health.damage(...)` --
   * otherwise, this hazard has no hit points of its own, so any amount of
   * damage defeats it outright.
   *
   * @param amount  How much damage to apply
   * @param dealtBy The actor responsible for the damage, if any
   */
  public takeDamage(amount: number, dealtBy?: Actor) {
    const health = findBehavior(this._actor!, HealthBehavior);
    if (health) health.damage(amount, dealtBy);
    else this.defeatSelf(dealtBy);
  }

  /**
   * Run `onDefeated` (if provided), play the defeat sound, and bump the
   * `HazardBehavior.ENEMIES_DEFEATED` counter -- but does *not* remove the
   * actor.  Used both by `defeatSelf` (which does remove it) and by the
   * `HealthBehavior.onDefeated` chain installed in `attach()` (where
   * `HealthBehavior.damage()` removes it instead).
   *
   * @param defeatedBy The actor responsible for the defeat, if any
   */
  private announceDefeat(defeatedBy?: Actor) {
    if (this.onDefeated) this.onDefeated(this._actor!, defeatedBy);
    this._actor?.sounds?.play("defeat");
    stage.score.counters.add(HazardBehavior.ENEMIES_DEFEATED, 1);
  }

  /**
   * Run `announceDefeat`, then remove this hazard.  Used when there's no
   * `HealthBehavior` to do the removal instead (see `attach()`).
   *
   * @param defeatedBy The actor responsible for the defeat, if any
   */
  private defeatSelf(defeatedBy?: Actor) {
    this.announceDefeat(defeatedBy);
    this._actor!.remove();
  }

  /**
   * Resolve the outcome of a contact with `other`: instant defeat,
   * immunity-driven self-defeat, or `onContact`'s outcome
   *
   * @param self  This hazard's actor
   * @param other The actor touching `self`
   */
  onCollide(self: Actor, other: Actor) {
    if (!this.eligible(other)) return false;

    const otherHealth = findBehavior(other, HealthBehavior);

    if (this.instantDefeat) {
      if (otherHealth) otherHealth.damage(otherHealth.hitPoints, self, true);
      else other.remove();
      return true;
    }

    if (otherHealth && otherHealth.invincibleRemaining > 0) {
      if (!this.immuneToInvincibility) this.defeatSelf(other);
      return true;
    }

    const amount = this.onContact(relativeZone(self, other));
    if (amount < 0) {
      this.defeatSelf(other);
    } else if (amount > 0) {
      if (otherHealth) otherHealth.damage(amount, self);
      else other.remove();
    }
    return true;
  }
}

/**
 * SolidBehavior is for things that other bodies bounce off of, rather than pass
 * through. These tend to be pretty customizable.  They can be moved, and used
 * in all sorts of other ways.
 */
export class SolidBehavior extends Behavior {
  /** Code to run when any other actor touches this */
  public onContact?: (self: Actor, other: Actor) => void;

  /**
   * Should a `ThrowableBehavior` that touches this disappear (default
   * true)?  Set false to let projectiles bounce/pass off this instead of
   * being destroyed -- Box2D's own physics does the actual bouncing once
   * the projectile isn't removed, so this is the only decision this makes.
   */
  public absorbsProjectiles: boolean;

  /** Which of this Solid's sides "count" as ground, letting a jumping actor jump again */
  public jumpReEnableSides: DIRECTION[];

  /**
   * Construct a SolidBehavior
   *
   * @param cfg.onContact           Code to run when any actor collides with this
   * @param cfg.absorbsProjectiles  Should a `ThrowableBehavior` that touches
   *                                this disappear? (default true)
   * @param cfg.jumpReEnableSides   Which sides "count" for letting a jumping
   *                                actor jump again (default: all)
   * @param cfg.team                The team this actor belongs to (default 0)
   */
  constructor(cfg: { onContact?: (self: Actor, other: Actor) => void, absorbsProjectiles?: boolean, jumpReEnableSides?: DIRECTION[], team?: number } = {}) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.SOLID);

    this.onContact = cfg.onContact;
    this.absorbsProjectiles = cfg.absorbsProjectiles ?? true;

    this.jumpReEnableSides = cfg.jumpReEnableSides ?? [DIRECTION.N, DIRECTION.S, DIRECTION.E, DIRECTION.W];
  }

  /**
   * Play the collide sound, run `onContact` (if provided), let a
   * `JumpBehavior` on `other` jump again if it touched us from a "ground"
   * side, and remove `other` if it's a `ThrowableBehavior` and
   * `absorbsProjectiles` is set.  This is the one place that decides
   * projectile disappearance -- `ThrowableBehavior.onCollide` always defers
   * to it (see there), so the outcome never depends on which of the two
   * actors happens to be dispatched first.
   */
  onCollide(self: Actor, other: Actor) {
    this.playCollideSound();
    if (this.onContact) this.onContact(self, other);

    // If the other actor can jump, and touched us from one of our "ground"
    // sides, let it jump again.  We use the same geometry-based zone
    // classification as HazardBehavior, instead of the old bounding-box
    // edge-overlap computation.
    const jb = findBehavior(other, JumpBehavior);
    if (jb) {
      const zone = relativeZone(self, other);
      if (this.jumpReEnableSides.includes(zone)) jb.resetJumps();
    }

    const throwable = findBehavior(other, ThrowableBehavior);
    if (throwable && this.absorbsProjectiles) {
      other.remove();
      if (throwable.reclaimer) throwable.reclaimer(other);
    }

    return true;
  }

  /**
   * Internal method for playing a sound when something collides with this.
   * Since collisions can repeat with high frequency, we use this to avoid
   * re-playing the sound before it even finishes.
   */
  private playCollideSound() {
    this._actor?.sounds?.playIfNotPlaying("collide");
  }
}

/**
 * TriggerBehavior is for an actor who doesn't register Box2D collisions, but
 * runs code on contact
 */
export class TriggerBehavior extends Behavior {
  /** The actor associated with this Behavior */
  public set actor(actor: Actor | undefined) {
    this._actor = actor;
    this.disableCollisions(actor);
  }

  /** The actor associated with this Behavior */
  public get actor() { return this._actor; }

  /** The code to run when an eligible actor crosses this */
  public onTrigger: (self: Actor, other: Actor) => void;

  /** Which actors trigger this?  Defaults to player-controlled actors only. */
  public eligible: (other: Actor) => boolean;

  /**
   * Construct a TriggerBehavior
   *
   * @param cfg.onTrigger The code to run when an eligible actor crosses this
   * @param cfg.eligible  Which actors trigger this (default: only
   *                       player-controlled actors)
   * @param cfg.team      The team this actor belongs to (default 0)
   */
  constructor(cfg: { onTrigger: (self: Actor, other: Actor) => void, eligible?: (other: Actor) => boolean, team?: number }) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.TRIGGER);
    this.onTrigger = cfg.onTrigger;
    this.eligible = cfg.eligible ?? defaultPlayerOnly;
  }

  /**
   * Run `onTrigger` if `other` is eligible
   *
   * @param self  This Behavior's actor
   * @param other The actor touching `self`
   */
  onCollide(self: Actor, other: Actor) {
    if (!this.eligible(other)) return false;
    this.onTrigger(self, other);
    return true;
  }
}

/**
 * ProximityBehavior isn't actually for collisions: it's for storing the code to
 * run when an actor interacts with another actor's proximity sensor.
 */
export class ProximityBehavior extends Behavior {
  /** Code to run when another actor enters this actor's proximity zone */
  public onEnter?: (self: Actor, other: Actor) => void;

  /** Code to run when another actor leaves this actor's proximity zone */
  public onExit?: (self: Actor, other: Actor) => void;

  /**
   * Construct a ProximityBehavior
   *
   * @param cfg.onEnter Code to run when another actor enters this actor's
   *                    proximity zone
   * @param cfg.onExit  Code to run when another actor leaves this actor's
   *                    proximity zone
   */
  constructor(cfg: { onEnter?: (self: Actor, other: Actor) => void, onExit?: (self: Actor, other: Actor) => void } = {}) {
    super();
    this.onEnter = cfg.onEnter;
    this.onExit = cfg.onExit;
  }
}

/**
 * Notify `self`'s ProximityBehavior(s) (if any) that `other` entered its
 * proximity-sensor zone
 *
 * @param self  The actor whose ProximityBehavior(s) are being notified
 * @param other The actor that entered `self`'s proximity zone
 */
export function dispatchProximityStart(self: Actor, other: Actor) {
  self.behaviors.forEach(b => { if (b instanceof ProximityBehavior) b.onEnter?.(self, other); });
}

/**
 * Notify `self`'s ProximityBehavior(s) (if any) that `other` left its
 * proximity-sensor zone.
 *
 * @param self  The actor whose ProximityBehavior(s) are being notified
 * @param other The actor that left `self`'s proximity zone
 */
export function dispatchProximityEnd(self: Actor, other: Actor) {
  self.behaviors.forEach(b => { if (b instanceof ProximityBehavior) b.onExit?.(self, other); });
}

/**
 * ThrowableBehavior is for actors that can be tossed from another actor's
 * location, in order to damage hazards.
 */
export class ThrowableBehavior extends Behavior {
  /**
   * Attaching this behavior upgrades a non-dynamic body to dynamic, and
   * marks it as a "bullet" (Box2D's continuous collision detection) so a
   * fast-moving throwable can't tunnel through a thin wall between physics
   * steps.  `ProjectileMovement` already does this too, but a throwable
   * shouldn't depend on also having a `ProjectileMovement` to get it.
   */
  public set actor(actor: Actor | undefined) {
    this._actor = actor;
    this.requireDynamicBody(actor, "ThrowableBehavior");
    actor?.rigidBody.body.SetBullet(true);
  }

  /** The actor associated with this Behavior */
  public get actor() { return this._actor; }

  /** This is the initial point from which the throwable was tossed */
  readonly rangeFrom = { x: 0, y: 0 };

  /**
   * When throwables collide, and they are not sensors, one will disappear. We
   * can keep both on screen by setting this false
   */
  public disappearOnCollide: boolean;

  /** How much damage does this throwable do? */
  public damage: number;

  /** Code to run when this throwable is reclaimed due to a collision */
  readonly reclaimer?: (actor: Actor) => void;

  /**
   * Construct a ThrowableBehavior
   *
   * @param cfg.damage              How much damage should this do? (default 1)
   * @param cfg.disappearOnCollide  Should this disappear when it collides
   *                                with another throwable? (default true)
   * @param cfg.reclaimer           Code to run when this is reclaimed due to
   *                                a collision
   * @param cfg.team                The team this actor belongs to (default 0)
   */
  constructor(cfg: { damage?: number, disappearOnCollide?: boolean, reclaimer?: (actor: Actor) => void, team?: number } = {}) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.THROWABLE);
    this.damage = cfg.damage ?? 1;
    this.disappearOnCollide = cfg.disappearOnCollide != undefined ? cfg.disappearOnCollide : true;
    this.reclaimer = cfg.reclaimer;
  }

  /**
   * React to touching another ThrowableBehavior or a HazardBehavior
   * (dealing damage); otherwise, do nothing.  Touching a `SolidBehavior` is
   * deliberately *not* handled here -- this always defers to it (see
   * `SolidBehavior.onCollide`), so the disappearance decision is made in
   * exactly one place, regardless of which of the two actors happens to be
   * dispatched first.
   */
  onCollide(self: Actor, other: Actor) {
    if (findBehavior(other, SolidBehavior)) return false;
    const otherThrowable = findBehavior(other, ThrowableBehavior);
    if (otherThrowable) {
      if (!this.disappearOnCollide) return true;
      // only disappear if other is not a sensor
      if (other.rigidBody.collisionsEnabled) {
        self.remove();
        if (this.reclaimer) this.reclaimer(self);
      }
      return true;
    }
    const hazard = findBehavior(other, HazardBehavior);
    if (hazard) {
      hazard.takeDamage(this.damage, self);
      self.remove();
      if (this.reclaimer) this.reclaimer(self);
      return true;
    }
    return false;
  }

  /**
   * Toss in a single, predetermined direction
   *
   * @param cfg.actor    The actor who is performing the toss
   * @param cfg.offset   The distance between the center of the throwable and
   *                     the center of the actor tossing it
   * @param cfg.velocity The velocity of the throwable when it is tossed
   */
  public tossFixedDir(cfg: { actor: Actor, offset: { dx: number, dy: number }, velocity: { x: number, y: number } }) {
    let b = this.actor;
    if (!b) return;
    if (b.appearance[0] instanceof AnimatedSprite) (b.appearance[0] as AnimatedSprite).restartCurrentAnimation();
    b.rigidBody.body.SetEnabled(true);
    this.rangeFrom.x = cfg.actor.rigidBody.getCenter().x + cfg.offset.dx;
    this.rangeFrom.y = cfg.actor.rigidBody.getCenter().y + cfg.offset.dy;
    tossFixedDir(b, this.rangeFrom.x, this.rangeFrom.y, cfg.velocity.x, cfg.velocity.y);
    b.sounds?.play("toss");
    cfg.actor.state.changeState(b, StateEvent.TOSS_Y);
  }

  /**
   * Toss in the direction of a specified point.
   *
   * @param cfg.actor               The actor who is performing the toss
   * @param cfg.from                The center of the actor doing the toss
   * @param cfg.to                  The point at which to toss
   * @param cfg.offset              The distance between the center of the
   *                                throwable and the center of the actor
   *                                tossing it
   * @param cfg.multiplier          A multiplier on speed
   * @param cfg.fixedVectorVelocity A fixed velocity, regardless of distance
   * @param cfg.rotateVectorToss    Should this be rotated to face the direction
   *                                it's tossed?
   */
  public tossAt(cfg: { actor: Actor, from: { x: number, y: number }, to: { x: number, y: number }, offset: { dx: number, dy: number }, multiplier?: number, fixedVectorVelocity?: number, rotateVectorToss?: boolean }) {
    let b = this.actor;
    if (!b) return;
    if (b.appearance[0] instanceof AnimatedSprite) (b.appearance[0] as AnimatedSprite).restartCurrentAnimation();
    b.rigidBody.body.SetEnabled(true);
    this.rangeFrom.x = cfg.from.x + cfg.offset.dx;
    this.rangeFrom.y = cfg.from.y + cfg.offset.dy;
    tossAt(b, this.rangeFrom.x, this.rangeFrom.y, cfg.from.x, cfg.from.y, cfg.to.x, cfg.to.y, cfg.offset.dx, cfg.offset.dy, cfg.multiplier ?? 1, cfg.fixedVectorVelocity, cfg.rotateVectorToss);
    b.sounds?.play("toss");
    cfg.actor.state.changeState(b, StateEvent.TOSS_Y);
  }
}

/**
 * Notify `self`'s `PunchBehavior` (if any) that its punch hitbox touched
 * `other`.  Called by `Services/Collisions.ts` when a contact involves a
 * `punchFixture`, instead of the normal `dispatchCollision` path.
 *
 * @param self  The actor whose punch hitbox was touched
 * @param other The actor that touched `self`'s punch hitbox
 */
export function dispatchPunchContact(self: Actor, other: Actor) {
  self.behaviors.forEach(b => { if (b instanceof PunchBehavior) b.onPunchContact(self, other); });
}

/**
 * PunchBehavior gives an actor a temporary melee hitbox: a second, offset
 * fixture on the actor's own body (see `RigidBodyComponent.enablePunch`),
 * active for a fixed duration, that moves rigidly with the actor.
 */
export class PunchBehavior extends Behavior {
  /** How much damage does this punch do? */
  public damage: number;

  /**
   * Construct a PunchBehavior
   *
   * @param cfg.damage How much damage should a punch do?
   * @param cfg.team   The team this actor belongs to (default 0)
   */
  constructor(cfg: { damage: number, team?: number }) {
    super(cfg);
    this.damage = cfg.damage;
  }

  /**
   * Perform a punch: enable a temporary hitbox offset from this actor, for
   * `cfg.duration` seconds, then disable it automatically.
   *
   * @param cfg.offset   The distance between this actor's center and the punch
   *                     hitbox's center
   * @param cfg.radius   The radius of the punch hitbox (default 0.5)
   * @param cfg.duration How long the punch should last, in seconds
   */
  public punch(cfg: { offset: { dx: number, dy: number }, radius?: number, duration: number }) {
    const b = this._actor;
    if (!b) return;
    if (b.appearance[0] instanceof AnimatedSprite) (b.appearance[0] as AnimatedSprite).restartCurrentAnimation();
    b.rigidBody.enablePunch({ offsetX: cfg.offset.dx, offsetY: cfg.offset.dy, radius: cfg.radius ?? 0.5 });

    b.sounds?.play("punch");
    b.state.changeState(b, StateEvent.PUNCH_Y);
    stage.world.timer.addEvent(new TimedEvent(cfg.duration, false, () => {
      b.rigidBody.disablePunch();
      b.state.changeState(b, StateEvent.PUNCH_N);
    }));
  }

  /**
   * React to this actor's punch hitbox touching `other`: deal damage to a
   * `HazardBehavior` on `other`, then end the punch early, so one punch
   * can't hit more than one thing.
   *
   * @param self  This behavior's actor (the puncher)
   * @param other The actor that touched the punch hitbox
   */
  public onPunchContact(self: Actor, other: Actor) {
    const hazard = findBehavior(other, HazardBehavior);
    if (hazard) {
      hazard.takeDamage(this.damage, self);
      self.rigidBody.disablePunch();
    }
  }
}

/**
 * PassiveBehavior is for things that barely even count as being part of the
 * game, like background images, HUD text, etc.  This is the default Behavior
 * an Actor gets if none is specified.
 */
export class PassiveBehavior extends Behavior {
  /** The actor associated with this Behavior */
  public set actor(actor: Actor | undefined) {
    this._actor = actor;
    this.disableCollisions(actor);
  }

  /** The actor associated with this Behavior */
  public get actor() { return this._actor; }

  /**
   * Construct a PassiveBehavior
   *
   * @param cfg.team The team this actor belongs to (default 0)
   */
  constructor(cfg: { team?: number } = {}) {
    super(cfg);
    this.collisionRules.properties.push(CollisionExemptions.PASSIVE);
  }
}

/**
 * CustomBehavior is an escape hatch: arbitrary collision-reaction code, for
 * when none of the prefabricated Behaviors fit.
 */
export class CustomBehavior extends Behavior {
  /** The caller-supplied collision handler */
  public onCollide: (self: Actor, other: Actor) => boolean;

  /**
   * Construct a CustomBehavior
   *
   * @param cfg.onCollide Code to run on a collision; see `Behavior.onCollide`
   *                      for the meaning of its return value
   * @param cfg.team      The team this actor belongs to (default 0)
   */
  constructor(cfg: { onCollide: (self: Actor, other: Actor) => boolean, team?: number }) {
    super(cfg);
    this.onCollide = cfg.onCollide;
  }
}
