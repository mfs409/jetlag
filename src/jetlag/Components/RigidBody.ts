import { b2Body, b2BodyType, b2CircleShape, b2DistanceJoint, b2DistanceJointDef, b2Fixture, b2LinearStiffness, b2PolygonShape, b2RevoluteJoint, b2RevoluteJointDef, b2Transform, b2Vec2, b2WeldJointDef } from "@box2d/core";
import { stage } from "../Stage";
import { DebugSprite } from "../Services/ImageLibrary";
import { Actor, actorFromBody } from "../Entities/Actor";
import { DIRECTION, StateEvent } from "./StateManager";
import { Scene } from "../Entities/Scene";

/**
 * PhysicsCfg describes provides advanced, but optional, ways of altering the
 * physical behavior of rigid bodies when they are being constructed.  Each
 * field's own doc comment is the single source of truth for that option;
 * `CircleBody`/`BoxBody`/`PolygonBody`'s constructors just link here via
 * `{@link PhysicsCfg}` instead of re-describing every field.
 */
export interface PhysicsCfg {
  /** The scene where this body should be made (defaults to stage.world) */
  scene?: Scene;
  /** The density of the body */
  density?: number;
  /** The elasticity of the body */
  elasticity?: number;
  /** The friction of the body */
  friction?: number;
  /** Should rotation be disabled? */
  disableRotation?: boolean;
  /** Do collisions happen, or do other bodies glide through this? */
  collisionsEnabled?: boolean;
  /**
   * Which sides of the body are sticky, if any?  Expressed as the zone (see
   * `relativeZone`) an actor is in when touching that side, e.g. `DIRECTION.N`
   * for "stuff that touches my top."
   */
  stickySides?: DIRECTION[];
  /** Delay (milliseconds) after something stops sticking, before it can stick again */
  stickyDelay?: number;
  /**
   * Are collisions only valid from one direction?  Expressed as the zone
   * (see `relativeZone`) something must be in to collide with this body,
   * e.g. `DIRECTION.N` for "solid only when approached from above."
   */
  singleRigidSide?: DIRECTION;
  /** Entities with a matching nonzero Id don't collide with each other */
  passThroughId?: number[];
  /** The speed at which to rotate, in rotations per second */
  rotationSpeed?: number;
  /** Should the body be forced to be dynamic? */
  dynamic?: boolean;
  /** Should the body be forced to be kinematic? */
  kinematic?: boolean;
  /** Should the actor rotate based on its direction of movement? */
  rotateByDirection?: boolean;
}

/**
 * The base type for all rigid bodies in the game.  Rigid bodies can be Boxes,
 * Circles, and Polygons.
 */
abstract class RigidBodyBase {
  /** A debug context for drawing the "hit box" */
  public debug: DebugSprite | undefined;

  /** A debug context for drawing the proximity-sensor zone's outline, if it has one */
  public proximityDebug: DebugSprite | undefined;

  /** A debug context for drawing the punch hitbox's outline, if it has one */
  public punchDebug: DebugSprite | undefined;

  /** A definition for when we attach a revolute joint to this entity */
  revJointDef?: b2RevoluteJointDef;

  /** A joint that allows this entity to revolve around another */
  revJoint?: b2RevoluteJoint;

  /**
   * An absolute timestamp (comparable to `stage.renderer.now`) before which
   * nothing can stick to this entity.  Set (on the *sticky* body, not
   * whatever was riding it) by `breakStickyJoints()` whenever something
   * unsticks from it, using `stickyDelayMs`.
   */
  stickyUntilMs?: number;

  /**
   * How long (ms), after something stops sticking to this entity, before
   * anything can stick to it again.  Configured via `PhysicsCfg.stickyDelay`.
   * Whatever is configured is floored at `MIN_STICKY_DELAY_MS`: without
   * *some* delay, a body whose position hasn't yet moved this step would
   * just re-stick the instant the joint holding it is broken.
   */
  stickyDelayMs?: number;

  /**
   * Which sides of the body are sticky, if any?  `DIRECTION.N` means "stuff
   * touching my top sticks."
   */
  stickySides: DIRECTION[] = [];

  /** Entities with a matching Id don't collide with each other */
  passThroughId?: number[];

  /**
   * Are collisions only valid from one direction?  Expressed as a zone (see
   * `relativeZone` in Behavior.ts): `DIRECTION.N` means "solid only when
   * approached from above."
   */
  singleRigidSide?: DIRECTION;

  /** A joint for fusing entities together when one is "sticky" */
  public get stickyDistJoint() { return this._stickyDistJoint; }

  /** A joint for fusing entities together when one is "sticky" */
  public set stickyDistJoint(j: b2DistanceJoint | undefined) {
    if (this._stickyDistJoint) this.body.GetWorld().DestroyJoint(this._stickyDistJoint);
    this._stickyDistJoint = j;
  }

  /** A joint for fusing entities together when one is "sticky" */
  private _stickyDistJoint?: b2DistanceJoint;

  /** The physics body */
  public body!: b2Body;

  /** The entity's primary fixture */
  protected mainFixture!: b2Fixture;

  /** A second, sensor-only fixture for proximity behaviors */
  private _proximityFixture?: b2Fixture;

  /** A third, sensor-only fixture for punching behaviors */
  private _punchFixture?: b2Fixture;

  /** Radius of a circumscribed circle, for culling */
  public radius!: number;

  /** Width of the body */
  public w!: number;

  /** Height of the body */
  public h!: number;

  /** Does the actor rotate based on the direction it is moving? */
  private rotationByDirection = false;

  /**
   * Construct a RigidBody
   *
   * @param scene The physics world where this body exists
   */
  protected constructor(readonly scene: Scene) { }

  /**
   * Create a revolute joint between this entity and some other entity. Note
   * that both entities need to have some mass (density can't be 0) or else this
   * won't work.
   *
   * @param cfg.anchor       The entity around which this entity will rotate
   * @param cfg.anchorPoint  The point (relative to center) where the joint
   *                          fuses to the anchor
   * @param cfg.localPoint   The point (relative to center) where the joint
   *                          fuses to this entity
   *
   * @return The joint that was created
   */
  public setRevoluteJoint(cfg: { anchor: Actor, anchorPoint: { x: number, y: number }, localPoint: { x: number, y: number } }) {
    // make the this body dynamic
    if (this.body.GetType() !== b2BodyType.b2_dynamicBody) {
      stage.console.log(`Warning: You have called setRevoluteJoint on an actor whose body is not dynamic.  Switching to dynamic.\n ${Error().stack}`);
      this.body.SetType(b2BodyType.b2_dynamicBody);
    }
    // create joint, connect anchors
    this.revJointDef = new b2RevoluteJointDef();
    this.revJointDef.bodyA = cfg.anchor.rigidBody!.body;
    this.revJointDef.bodyB = this.body;
    this.revJointDef.localAnchorA.Set(cfg.anchorPoint.x, cfg.anchorPoint.y);
    this.revJointDef.localAnchorB.Set(cfg.localPoint.x, cfg.localPoint.y);
    // rotator and anchor don't collide
    this.revJointDef.collideConnected = false;
    this.revJointDef.referenceAngle = 0;
    this.revJointDef.enableLimit = false;
    this.revJoint = this.body.GetWorld().CreateJoint(this.revJointDef);
    return this.revJoint;
  }

  /**
   * Attach a motor to make a revolute joint turn
   *
   * @param cfg.motorSpeed  Speed in radians per second
   * @param cfg.motorTorque torque of the motor... when in doubt, go with
   *                        something huge, like positive infinity
   *
   * @return The modified joint.  The old revolute joint will be destroyed.
   */
  public setRevoluteJointMotor(cfg: { motorSpeed: number, motorTorque: number }) {
    // destroy the previously created joint, change the definition, re-create
    // the joint
    if (this.revJoint) {
      this.body.GetWorld().DestroyJoint(this.revJoint);
      this.revJointDef!.enableMotor = true;
      this.revJointDef!.motorSpeed = cfg.motorSpeed;
      this.revJointDef!.maxMotorTorque = cfg.motorTorque;
    }
    this.revJoint = this.body.GetWorld().CreateJoint(this.revJointDef!);
    return this.revJoint;
  }

  /**
   * Set upper and lower bounds on the rotation of a revolute joint
   *
   * @param cfg.upper The upper bound in radians
   * @param cfg.lower The lower bound in radians
   *
   * @return The modified joint.  The old revolute joint will be destroyed.
   */
  public setRevoluteJointLimits(cfg: { upper: number, lower: number }) {
    // destroy the previously created joint, change the definition, re-create
    // the joint
    this.body.GetWorld().DestroyJoint(this.revJoint!);
    this.revJointDef!.upperAngle = cfg.upper;
    this.revJointDef!.lowerAngle = cfg.lower;
    this.revJointDef!.enableLimit = true;
    this.revJoint = this.body.GetWorld().CreateJoint(this.revJointDef!);
    return this.revJoint;
  }

  /**
   * Create a weld joint between this entity and some other entity, to force the
   * entities to stick together.
   *
   * @param cfg.other       The entity that will be fused to this entity
   * @param cfg.otherPoint  The point (relative to center) where the joint
   *                        fuses to the other entity
   * @param cfg.localPoint  The point (relative to center) where the joint
   *                        fuses to this entity
   * @param cfg.angle       The angle between the entities
   *
   * @return The joint that was created
   */
  public setWeldJoint(cfg: { other: Actor, otherPoint: { x: number, y: number }, localPoint: { x: number, y: number }, angle: number }) {
    // make the this body dynamic
    if (this.body.GetType() !== b2BodyType.b2_dynamicBody) {
      stage.console.log(`Warning: You have called setWeldJoint on an actor whose body is not dynamic.  Switching to dynamic.\n ${Error().stack}`);
      this.body.SetType(b2BodyType.b2_dynamicBody);
    }
    let w = new b2WeldJointDef();
    w.bodyA = cfg.other.rigidBody!.body;
    w.bodyB = this.body;
    w.localAnchorA.Set(cfg.otherPoint.x, cfg.otherPoint.y);
    w.localAnchorB.Set(cfg.localPoint.x, cfg.localPoint.y);
    w.referenceAngle = cfg.angle;
    w.collideConnected = false;
    return this.body.GetWorld().CreateJoint(w);
  }

  /**
   * Create an explicit distance joint between this entity and some other entity
   *
   * @param cfg.anchor        The entity to which this entity is connected
   * @param cfg.anchorPoint   The point (relative to center) where the joint
   *                           fuses to the anchor
   * @param cfg.localPoint    The point (relative to center) where the joint
   *                           fuses to this entity
   * @param cfg.frequencyHz   How "stiff" the joint is, in Hz -- higher means
   *                           it snaps back toward its length more quickly.
   *                           Default 4.
   * @param cfg.dampingRatio  How much the joint resists oscillating.  0
   *                           means it can bounce/spring freely; 1 ("critical
   *                           damping") settles without overshooting.
   *                           Default 1.
   *
   * @return The joint that was created
   */
  public setDistanceJoint(cfg: { anchor: Actor, anchorPoint: { x: number, y: number }, localPoint: { x: number, y: number }, frequencyHz?: number, dampingRatio?: number }) {
    // make the this body dynamic
    if (this.body.GetType() !== b2BodyType.b2_dynamicBody) {
      stage.console.log(`Warning: You have called setDistanceJoint on an actor whose body is not dynamic.  Switching to dynamic.\n ${Error().stack}`);
      this.body.SetType(b2BodyType.b2_dynamicBody);
    }
    // set up a joint so the entity can't move too far
    let mDistJointDef = new b2DistanceJointDef();
    mDistJointDef.bodyA = cfg.anchor.rigidBody!.body;
    mDistJointDef.bodyB = this.body;
    mDistJointDef.localAnchorA.Set(cfg.anchorPoint.x, cfg.anchorPoint.y);
    mDistJointDef.localAnchorB.Set(cfg.localPoint.x, cfg.localPoint.y);
    mDistJointDef.collideConnected = false;
    // NB: `stiffness`/`damping` are raw spring constants, not something you
    //     should set directly -- their effect depends on the mass of the two
    //     bodies (the same stiffness that barely holds a heavy body would
    //     make a light one oscillate wildly).  b2LinearStiffness computes
    //     them properly from a frequency + damping ratio and the two
    //     bodies' actual masses.
    b2LinearStiffness(mDistJointDef, cfg.frequencyHz ?? 4, cfg.dampingRatio ?? 1, mDistJointDef.bodyA, mDistJointDef.bodyB);
    // NB: b2DistanceJointDef defaults `length` to 1, regardless of how far
    //     apart the anchors actually are.  Combined with a nonzero
    //     stiffness, that would make the joint actively pull/push the two
    //     entities toward being exactly 1 meter apart the instant it's
    //     created, instead of preserving their actual starting distance --
    //     so we compute the real distance between the two world-space
    //     anchor points and use that instead.
    const worldAnchorA = cfg.anchor.rigidBody!.body.GetWorldPoint(cfg.anchorPoint, new b2Vec2());
    const worldAnchorB = this.body.GetWorldPoint(cfg.localPoint, new b2Vec2());
    mDistJointDef.length = b2Vec2.Distance(worldAnchorA, worldAnchorB);
    return this.body.GetWorld().CreateJoint(mDistJointDef);
  }

  /**
   * The minimum time (ms) that must pass, after something unsticks from a
   * sticky entity, before anything can stick to it again.  This is a floor
   * on `stickyDelayMs`, not just a default: without it, a body whose
   * position hasn't yet moved this step would re-stick the instant its
   * joint is broken (see `breakStickyJoints`).
   */
  private static readonly MIN_STICKY_DELAY_MS = 10;

  /**
   * Break any distance joint connecting this entity on account of the
   * "sticky" feature, or this actor won't be able to move (the setter
   * destroys the joint).  Joints created via `setDistanceJoint()` won't be
   * destroyed by this call.
   *
   * If this entity was actually stuck to something, this also starts that
   * sticky entity's re-stick cooldown (`stickyDelayMs`, floored at
   * `MIN_STICKY_DELAY_MS`) -- the delay belongs to the sticky entity, not to
   * whatever was riding it, so it applies no matter who/what unsticks.
   */
  public breakStickyJoints() {
    if (this._stickyDistJoint) {
      const stickyActor = actorFromBody(this._stickyDistJoint.GetBodyA());
      const stickyBody = stickyActor?.rigidBody;
      if (stickyBody) {
        const delay = Math.max(RigidBodyBase.MIN_STICKY_DELAY_MS, stickyBody.stickyDelayMs ?? 0);
        stickyBody.stickyUntilMs = stage.renderer.now + delay;
      }
    }
    // Clobber any distance joints that were made because of the "sticky"
    // feature, or this actor won't be able to move (the setter destroys it)
    this.stickyDistJoint = undefined;
  }

  /**
   * Adjust the default physics settings (density, elasticity, friction) for
   * this entity
   *
   * @param cfg.density    New density of the entity
   * @param cfg.elasticity New elasticity of the entity
   * @param cfg.friction   New friction of the entity
   */
  public setPhysics(cfg: { density?: number, elasticity?: number, friction?: number }) {
    if (cfg.density != undefined && cfg.density != 0) this.mainFixture.SetDensity(cfg.density);
    if (cfg.elasticity != undefined) this.mainFixture.SetRestitution(cfg.elasticity);
    if (cfg.friction != undefined) this.mainFixture.SetFriction(cfg.friction);
    this.body.ResetMassData();
  }

  /**
   * Copy an old fixture's density/elasticity/friction/sensor state onto
   * `mainFixture` (the fixture that just replaced it), then destroy the old
   * one.  Shared by every subclass's `resize()`, since this tail is
   * identical regardless of shape.
   *
   * @param oldFix The fixture that `mainFixture` is replacing
   */
  protected finishResize(oldFix: b2Fixture) {
    this.setPhysics({ density: oldFix.GetDensity(), elasticity: oldFix.GetRestitution(), friction: oldFix.GetFriction() });
    if (oldFix.IsSensor()) this.collisionsEnabled = false;
    this.body.DestroyFixture(oldFix);
  }

  /**
   * Report if this entity's main shape causes transfer of momentum when it
   * collides with other entities (true) or not (false).  This only
   * concerns the main fixture -- the proximity fixture (see
   * `proximityRadius`), if any, is always a sensor, regardless of this
   * setting.
   */
  public get collisionsEnabled() { return !this.mainFixture.IsSensor(); }

  /**
   * Indicate whether this entity engages in physics collisions or not
   *
   * @param val True or false, depending on whether the entity will
   *            participate in physics collisions or not
   */
  public set collisionsEnabled(val: boolean) { this.mainFixture.SetSensor(!val); }

  /** The fixture used for this entity's proximity-sensor zone, if `proximityRadius` has been set */
  public get proximityFixture() { return this._proximityFixture; }

  /**
   * The radius (in meters) of this entity's proximity-sensor zone, or
   * `undefined` if it has none.
   */
  public get proximityRadius() {
    return this._proximityFixture ? (this._proximityFixture.GetShape() as b2CircleShape).m_radius : undefined;
  }

  /**
   * Give this entity a proximity-sensor zone: a second, sensor-only
   * fixture on the same body, separate from its normal solid fixture, so
   * it can have both real physical collisions (or none, if
   * `collisionsEnabled` is false) and a much larger "something is nearby"
   * detection radius at the same time.  Box2D fires contact events for
   * this fixture exactly like any other, but `Services/Collisions.ts`
   * routes them to `ProximityBehavior` instead of the normal collision
   * dispatch.  Pass `undefined` to remove an existing proximity zone.
   *
   * NB: Unlike the entity's main shape, the proximity radius does not
   *     automatically rescale when `resize()` is called.
   *
   * @param radius The radius of the proximity zone, in meters, or
   *               `undefined` to remove it
   */
  public set proximityRadius(radius: number | undefined) {
    if (this._proximityFixture) {
      this.body.DestroyFixture(this._proximityFixture);
      this._proximityFixture = undefined;
      this.proximityDebug = undefined;
    }
    if (radius !== undefined) {
      let shape = new b2CircleShape();
      shape.m_radius = radius;
      this._proximityFixture = this.body.CreateFixture({ shape, isSensor: true, density: 0 });
      // CreateFixture does not wake the body, and Box2D skips contact
      // updates (even for sensors) when both bodies in a pair are asleep.
      this.body.SetAwake(true);
      if (stage.config.hitBoxes) this.proximityDebug = new DebugSprite();
    }
  }

  /** The fixture used for this entity's punch hitbox, if `enablePunch` has been called and `disablePunch` hasn't run yet */
  public get punchFixture() { return this._punchFixture; }

  /**
   * Give this entity a punch hitbox: a third, sensor-only fixture on the
   * same body, offset from its center, so a melee attack can be modeled as
   * a circle that moves rigidly with this entity -- no separate actor, no
   * joint.  Box2D fires contact events for this fixture exactly like any
   * other; `Services/Collisions.ts` routes them to `PunchBehavior` instead
   * of the normal collision dispatch.  Replaces any punch hitbox already in
   * progress; see `disablePunch` to remove it without replacing it.
   *
   * @param cfg.offsetX The x distance from this entity's center to the
   *                    hitbox's center
   * @param cfg.offsetY The y distance from this entity's center to the
   *                    hitbox's center
   * @param cfg.radius  The radius of the hitbox
   */
  public enablePunch(cfg: { offsetX: number, offsetY: number, radius: number }) {
    this.disablePunch();
    let shape = new b2CircleShape();
    shape.m_p.Set(cfg.offsetX, cfg.offsetY);
    shape.m_radius = cfg.radius;
    this._punchFixture = this.body.CreateFixture({ shape, isSensor: true, density: 0 });
    // NB: Need to SetAwake, because createFixture does not wake the body, and
    // Box2D skips contact updates (even for sensors) when both bodies in a pair
    // are asleep.
    this.body.SetAwake(true);
    if (stage.config.hitBoxes) this.punchDebug = new DebugSprite();
  }

  /** Remove this entity's punch hitbox if it has one */
  public disablePunch() {
    if (this._punchFixture) {
      this.body.DestroyFixture(this._punchFixture);
      this._punchFixture = undefined;
      this.punchDebug = undefined;
    }
  }

  /** The current rotation of the entity, in radians */
  public get rotation() { return this.body.GetAngle(); }

  /** The current rotation of the entity, in radians */
  public set rotation(rotation: number) {
    this.breakStickyJoints();
    let transform = new b2Transform().SetPositionAngle(this.body.GetPosition(), rotation);
    this.body.SetTransform(transform);
  }

  /** Return the center of the entity */
  public getCenter() { return this.body.GetPosition(); }

  /**
   * Change the position of an entity
   *
   * @param cx  The new X position, in meters
   * @param cy  The new Y position, in meters
   */
  public setCenter(cx: number, cy: number) {
    this.breakStickyJoints();
    let transform = new b2Transform();
    transform.SetPositionAngle(new b2Vec2(cx, cy), this.body.GetAngle());
    this.body.SetTransform(transform);
  }

  /**
   * The prerender step will move the Entity's Appearance based on its RigidBody
   * 
   * @param _elapsedMs  The time since the last render
   * @param actor       The entity to which this RigidBody is attached
   */
  public prerender(_elapsedMs: number, actor: Actor) {
    // Broadcast the left/right movement of this entity
    let v = this.body.GetLinearVelocity();
    // NB: Ignore when the speed is exceedingly small
    let x = (Math.abs(v.x) < 0.01) ? 0 : v.x;
    let y = (Math.abs(v.y) < 0.01) ? 0 : v.y;
    if (x > 0 && y > 0) actor.state.changeState(actor, StateEvent.MOVE_SE);
    else if (x > 0 && y < 0) actor.state.changeState(actor, StateEvent.MOVE_NE);
    else if (x > 0 && y == 0) actor.state.changeState(actor, StateEvent.MOVE_E);
    else if (x < 0 && y > 0) actor.state.changeState(actor, StateEvent.MOVE_SW);
    else if (x < 0 && y < 0) actor.state.changeState(actor, StateEvent.MOVE_NW);
    else if (x < 0 && y == 0) actor.state.changeState(actor, StateEvent.MOVE_W);
    else if (x == 0 && y > 0) actor.state.changeState(actor, StateEvent.MOVE_S);
    else if (x == 0 && y < 0) actor.state.changeState(actor, StateEvent.MOVE_N);
    else if (x == 0 && y == 0) actor.state.changeState(actor, StateEvent.STOP);

    if (this.rotationByDirection)
      this.rotateByMovement();
  }

  /**
   * Update physics properties
   *
   * @param physicsCfg  A description of which properties to change
   */
  protected updatePhysics(physicsCfg: PhysicsCfg) {
    // Switch the body to dynamic or kinematic?
    if (physicsCfg.dynamic) this.body.SetType(b2BodyType.b2_dynamicBody);
    else if (physicsCfg.kinematic) this.body.SetType(b2BodyType.b2_kinematicBody);

    // Update density/elasticity/friction?
    if (physicsCfg.density !== undefined && physicsCfg.density != 0)
      this.setPhysics({ density: physicsCfg.density })
    if (physicsCfg.elasticity !== undefined)
      this.setPhysics({ elasticity: physicsCfg.elasticity })
    if (physicsCfg.friction !== undefined)
      this.setPhysics({ friction: physicsCfg.friction });

    // Enable/disable collisions?
    if (physicsCfg.collisionsEnabled !== undefined)
      this.collisionsEnabled = physicsCfg.collisionsEnabled;

    // Update sticky properties?  `stickyDelayMs` just records the configured
    // duration.  `breakStickyJoints()` is what turns it into an actual
    // `stickyUntilMs` deadline, at the moment something unsticks.
    if (physicsCfg.stickyDelay !== undefined)
      this.stickyDelayMs = physicsCfg.stickyDelay;
    if (physicsCfg.stickySides !== undefined) {
      this.stickySides = [...physicsCfg.stickySides];
    }

    // Pass-through?
    if (physicsCfg.passThroughId !== undefined)
      this.passThroughId = physicsCfg.passThroughId;

    // Rigidity?
    if (physicsCfg.singleRigidSide !== undefined)
      this.singleRigidSide = physicsCfg.singleRigidSide;

    // Make the entity continuously rotate?
    if (physicsCfg.rotationSpeed !== undefined) {
      if (this.body.GetType() == b2BodyType.b2_staticBody) {
        stage.console.log(`Warning: You have assigned a rotationSpeed to an actor whose body is static.  Switching to kinematic.\n ${Error().stack}`);
        this.body.SetType(b2BodyType.b2_kinematicBody);
      }
      this.body.SetAngularVelocity(physicsCfg.rotationSpeed * 2 * Math.PI);
    }

    // No rotation, even after torque-inducing collisions?
    if (physicsCfg.disableRotation) this.body.SetFixedRotation(true);

    // Should it rotate in the direction of movement
    this.rotationByDirection = !!physicsCfg.rotateByDirection;
  }

  /** Make the entity stop rotating */
  public clearRotation() {
    if (this.body.GetType() != b2BodyType.b2_staticBody)
      this.body.SetAngularVelocity(0);
  }

  /** Report the current velocity of this body */
  public getVelocity() { return this.body.GetLinearVelocity().Clone(); }

  /** The Y velocity of this actor */
  public get yVelocity() { return this.body.GetLinearVelocity().y; }

  /** Update the Y velocity, without affecting the X velocity */
  public set yVelocity(v: number) {
    if (!this.body.IsEnabled()) return;
    this.breakStickyJoints();
    this.body.SetLinearVelocity({ x: this.body.GetLinearVelocity().x ?? 0, y: v });
  }

  /** The X velocity of this actor */
  public get xVelocity() { return this.body.GetLinearVelocity().x; }

  /** Update the X velocity, without affecting the Y velocity */
  public set xVelocity(v: number) {
    if (!this.body.IsEnabled()) return;
    this.breakStickyJoints();
    this.body.SetLinearVelocity({ x: v, y: this.body.GetLinearVelocity().y ?? 0 });
  }

  /**
   * Apply a force to the actor
   *
   * @param x The force to apply in the x dimension
   * @param y The force to apply in the y dimension
   */
  public applyForce(x: number, y: number) {
    if (!this.body.IsEnabled()) return;
    this.breakStickyJoints();
    this.body.ApplyForceToCenter(new b2Vec2(x, y));
  }

  /**
   * Update the velocity
   *
   * @param x The new x velocity
   * @param y The new y velocity
   */
  public setVelocity(x: number, y: number) {
    if (!this.body.IsEnabled()) return;
    this.breakStickyJoints();
    this.body.SetLinearVelocity({ x, y });
  }

  /**
   * Set the angular velocity, for making a body rotate
   *
   * @param rps The velocity, in radians per second
   */
  public updateAngularVelocity(rps: number) {
    this.body.SetAngularVelocity(rps);
  }

  /** Indicate that this actor should rotate based on its direction of movement */
  private rotateByMovement() {
    let x = -this.body.GetLinearVelocity().x;
    let y = -this.body.GetLinearVelocity().y;
    let angle = Math.atan2(y, x) + Math.atan2(-1, 0);
    let transform = new b2Transform();
    transform.SetPositionAngle(this.body.GetPosition(), angle);
    this.body.SetTransform(transform);
  }

  /**
   * Change the rotation of the body
   *
   * @param delta How much to add to the current rotation
   */
  public increaseRotation(delta: number) {
    let rot = this.body.GetAngle() + delta;
    this.body.SetAngularVelocity(0);
    let transform = new b2Transform();
    transform.SetPositionAngle(this.body.GetPosition(), rot);
    this.body.SetTransform(transform);
  }

  /**
   * Set a dampening factor to cause a moving body to slow down without
   * colliding with anything
   *
   * @param amount The amount of damping to apply
   */
  public setDamping(amount: number) {
    this.body.SetLinearDamping(amount);
  }

  /**
   * Set a dampening factor to cause a spinning body to decrease its rate of
   * spin
   *
   * @param amount The amount of damping to apply
   */
  public setAngularDamping(amount: number) {
    this.body.SetAngularDamping(amount);
  }

  /** Indicate that this actor should be immune to the force of gravity */
  public setGravityDefy() {
    this.body.SetGravityScale(0);
  }

  /**
   * Add velocity to this actor
   *
   * @param x Velocity in X dimension
   * @param y Velocity in Y dimension
   */
  public addVelocity(x: number, y: number) {
    // Add to the velocity of the actor
    let v = this.body.GetLinearVelocity();
    let x2 = v.x + x;
    let y2 = v.y + y;
    this.setVelocity(x2, y2);
  }

  /** Indicate whether this body is allowed to rotate or not */
  setRotatable(val: boolean) {
    this.body.SetFixedRotation(!val);
  }
}

/** A rigid body whose underlying shape is a circle */
export class CircleBody extends RigidBodyBase {
  /**
   * Construct a CircleBody
   *
   * @param circleCfg         The basic shape configuration for the circle
   * @param circleCfg.cx      X coordinate of the center of the circle
   * @param circleCfg.cy      Y coordinate of the center of the circle
   * @param circleCfg.radius  Radius of the circle
   * @param physicsCfg        Optional physics configuration; see
   *                          {@link PhysicsCfg} for the full set of options
   *
   * @returns A rigid body with a Circle shape
   */
  constructor(circleCfg: { cx: number, cy: number, radius: number }, physicsCfg: PhysicsCfg = {}) {
    let scene = physicsCfg.scene ?? stage.world;
    super(scene);
    let body = scene.physics!.world.CreateBody({ type: b2BodyType.b2_staticBody, position: { x: circleCfg.cx, y: circleCfg.cy } });
    this.body = body;
    this.radius = circleCfg.radius;
    if (stage.config.hitBoxes) this.debug = new DebugSprite();
    this.w = 2 * circleCfg.radius;
    this.h = 2 * circleCfg.radius;

    let shape = new b2CircleShape();
    shape.m_radius = circleCfg.radius;
    this.mainFixture = this.body.CreateFixture({ shape });
    this.setPhysics({ density: 1, elasticity: 0, friction: 0 });
    this.updatePhysics(physicsCfg);
  }

  /**
   * Resize a CircleBody
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  public resize(scale: number) {
    // Get the current fixture, so we can preserve sensor state,
    // density/elasticity/friction, and vertices when we make a new fixture
    let oldFix = this.mainFixture;

    // Update dimensions
    this.radius *= scale;
    this.w *= scale;
    this.h *= scale;

    // make a new circle body
    let shape = new b2CircleShape();
    shape.m_radius = this.radius;
    this.mainFixture = this.body.CreateFixture({ shape });

    this.finishResize(oldFix);
  }
};

/** A rigid body whose underlying shape is a rectangle */
export class BoxBody extends RigidBodyBase {
  /**
   * Construct a BoxBody
   *
   * @param boxCfg        The basic shape configuration for the box
   * @param boxCfg.cx     X coordinate of the center of the box
   * @param boxCfg.cy     Y coordinate of the center of the box
   * @param boxCfg.width  Width of the box
   * @param boxCfg.height Height of the box
   * @param physicsCfg    Optional physics configuration; see
   *                      {@link PhysicsCfg} for the full set of options
   *
   * @returns A rigid body with a Box shape
   */
  constructor(boxCfg: { cx: number, cy: number, width: number, height: number }, physicsCfg: PhysicsCfg = {}) {
    let scene = physicsCfg.scene ?? stage.world;
    super(scene);
    let body = scene.physics!.world.CreateBody({ type: b2BodyType.b2_staticBody, position: { x: boxCfg.cx, y: boxCfg.cy } });
    this.body = body;
    this.radius = Math.sqrt(Math.pow(boxCfg.height / 2, 2) + Math.pow(boxCfg.width / 2, 2))
    if (stage.config.hitBoxes) this.debug = new DebugSprite();
    this.w = boxCfg.width;
    this.h = boxCfg.height;
    let shape = new b2PolygonShape();
    shape.SetAsBox(this.w / 2, this.h / 2);
    this.mainFixture = this.body.CreateFixture({ shape });
    this.setPhysics({ density: 1, elasticity: 0, friction: 0 });
    this.updatePhysics(physicsCfg);
  }

  /**
   * Resize a BoxBody
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  public resize(scale: number) {
    // Get the current fixture, so we can preserve sensor state,
    // density/elasticity/friction, and vertices when we make a new fixture
    let oldFix = this.mainFixture;

    // Update dimensions
    this.radius *= scale;
    this.w *= scale;
    this.h *= scale;

    // make a new box body
    let shape = new b2PolygonShape();
    shape.SetAsBox(this.w / 2, this.h / 2);
    this.mainFixture = this.body.CreateFixture({ shape });

    this.finishResize(oldFix);
  }
};

/** A rigid body whose underlying shape is a convex polygon */
export class PolygonBody extends RigidBodyBase {
  /** Vertices of this polygon */
  public vertArray: b2Vec2[] = [];

  /**
   * Construct a PolygonBody
   *
   * @param polygonCfg          The basic shape configuration for the polygon
   * @param polygonCfg.cx       X coordinate of the center of the polygon
   * @param polygonCfg.cy       Y coordinate of the center of the polygon
   * @param polygonCfg.vertices Vertices of the polygon, as points that are
   *                            offsets relative to (cx, cy)
   * @param physicsCfg          Optional physics configuration; see
   *                            {@link PhysicsCfg} for the full set of options
   *
   * @returns A rigid body with a Polygon shape
   */
  constructor(polygonCfg: { cx: number, cy: number, vertices: { x: number, y: number }[] }, physicsCfg: PhysicsCfg = {}) {
    let scene = physicsCfg.scene ?? stage.world;
    super(scene);
    this.body = scene.physics!.world.CreateBody({ type: b2BodyType.b2_staticBody, position: { x: polygonCfg.cx, y: polygonCfg.cy } });
    // Compute the radius of the circumscribing circle
    let r = 0;
    for (let v of polygonCfg.vertices)
      r = Math.max(r, Math.pow(v.x, 2) + Math.pow(v.y, 2));

    if (stage.config.hitBoxes) this.debug = new DebugSprite();
    // Transform the vertices into Box2D points, and also compute the polygon's
    // maximum x and y distances, for computing the culling dimensions
    let absMaxX = 0, absMaxY = 0;
    for (let i = 0; i < polygonCfg.vertices.length; i++) {
      this.vertArray[i] = new b2Vec2(polygonCfg.vertices[i].x, polygonCfg.vertices[i].y);
      absMaxX = Math.max(absMaxX, Math.abs(this.vertArray[i].x))
      absMaxY = Math.max(absMaxY, Math.abs(this.vertArray[i].y))
    }
    this.w = 2 * absMaxX;
    this.h = 2 * absMaxY;

    this.radius = Math.sqrt(r);
    let shape = new b2PolygonShape();
    shape.Set(this.vertArray);
    this.mainFixture = this.body.CreateFixture({ shape });
    this.setPhysics({ density: 1, elasticity: 0, friction: 0 });
    this.updatePhysics(physicsCfg);
  }

  /**
   * Resize a PolygonBody
   *
   * @param scale The amount to scale the size by.  1 means "no change", >1
   *              means "grow", fraction means "shrink".
   */
  public resize(scale: number) {
    // Get the current fixture, so we can preserve sensor state,
    // density/elasticity/friction, and vertices when we make a new fixture
    let oldFix = this.mainFixture;

    // we need to manually scale all the vertices, based on the old verts
    let ps = oldFix.GetShape() as b2PolygonShape;
    let vertArray = ps.m_vertices.map(v => new b2Vec2(v.x * scale, v.y * scale));
    this.vertArray = vertArray;

    // Update dimensions
    this.radius *= scale;
    this.w *= scale;
    this.h *= scale;

    // Make a new polygon body
    let shape = new b2PolygonShape();
    shape.Set(vertArray);
    this.mainFixture = this.body.CreateFixture({ shape });

    this.finishResize(oldFix);
  }
};

/**
 * RigidBodyComponent is the type of any circle/box/polygon rigid body in JetLag
 */
export type RigidBodyComponent = CircleBody | BoxBody | PolygonBody;