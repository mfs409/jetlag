import { b2BodyType, b2Transform, b2Vec2 } from "@box2d/core";
import { Actor } from "../Entities/Actor";
import { stage } from "../Stage";
import { RigidBodyComponent } from "./RigidBody";
import { CameraService } from "../Services/Camera";

/**
 * Path specifies a set of points that an actor will move among, in order, at a
 * fixed speed.
 */
export class Path {
  /** The X/Y coordinates of the points in the path */
  private points: b2Vec2[] = [];

  /**
   * Add a new point to a path by giving the coordinates for where the center of
   * the actor goes next.  This returns the path, so that calls to `to` can be
   * chained.
   *
   * @param x X value of the new coordinate
   * @param y Y value of the new coordinate
   */
  public to(x: number, y: number): Path {
    this.points.push(new b2Vec2(x, y));
    return this;
  }

  /**
   * Return a copy of the ith point in the path.  We return a copy, so that the
   * caller can use the point.  `i` wraps around in both directions, so it's
   * always safe to pass, e.g., -1 (the last point) or `length` (the first
   * point again).
   *
   * @param i The index of the point to return (0-based)
   */
  public getPoint(i: number) {
    let idx = ((i % this.points.length) + this.points.length) % this.points.length;
    return new b2Vec2(this.points[idx].x, this.points[idx].y);
  }

  /** The number of points in this path */
  public get length() { return this.points.length; }
}

/** A rule for moving along a fixed path */
export class PathMovement {
  /** The path on which to move */
  private path: Path;

  /** The speed at which the actor should move */
  private velocity: number;

  /** Should the path repeat infinitely, or just run once? */
  private loop: boolean;

  /**
   * Code to run each time a waypoint of the path is reached.  It will be
   * given the index of the *next* waypoint.
   */
  private waypointCallback?: (which: number) => void;

  /** The RigidBodyComponent to which this movement is attached */
  public set rigidBody(body: RigidBodyComponent | undefined) {
    this._rigidBody = body;
    // This cannot be a static body
    if (this.rigidBody?.body.GetType() == b2BodyType.b2_staticBody) {
      stage.console.log(`Warning: You have attached a PathMovement to an actor with a static body.  Switching to kinematic.\n ${Error().stack}`);
      this.rigidBody.body.SetType(b2BodyType.b2_kinematicBody);
    }
    // A path with <2 points doesn't make sense...
    if (this.path.length < 2) this.halt();
    else this.start();
  }
  /** The RigidBodyComponent to which this movement is attached */
  public get rigidBody() { return this._rigidBody; }
  /** The RigidBodyComponent to which this movement is attached */
  private _rigidBody?: RigidBodyComponent;

  /** Is the path still running? */
  private done = false;

  /** Index of the next point in the path */
  private nextIndex = -1;

  /**
   * Code to run on the very first render step after construction.  This lets us
   * "skip_to" after construction, once the rigidBody is assigned.
   */
  private onFirstRender?: () => void;

  /**
   * Skip forward to one of the waypoints of the path.  Warns and does
   * nothing if the given waypoint is out of bounds for the current path
   * length.
   *
   * @param waypoint  The waypoint to skip to.
   */
  private skip_to(waypoint: number) {
    this.done = false;
    if (waypoint == 0) {
      this.start();
    }
    else if (waypoint >= this.path.length) {
      stage.console.log(`Error: skip_to(${waypoint}) is out of bounds for a path with ${this.path.length} points`);
      return;
    }
    else if (this.rigidBody) {
      // Move to the waypoint, then start moving to next
      let transform = new b2Transform().SetPositionAngle(this.path.getPoint(waypoint), this._rigidBody!.body.GetAngle());
      this.rigidBody.body.SetTransform(transform);
      if (this.waypointCallback) this.waypointCallback(waypoint); // Run callback for point reached
      this.nextIndex = waypoint + 1;
      if (this.nextIndex == this.path.length) {
        if (this.loop) this.start(); // start over for the looping case
        else this.halt(); // halt the path for the non-looping case
        return;
      }
      this.goToNext();
    }
  }

  /** Stop processing a path, and stop the actor too */
  private halt() {
    if (!this.rigidBody) return;
    this.done = true;
    // Stop the movement
    this.rigidBody.setVelocity(0, 0);
  }

  /** Start the actor moving toward the next point in the path */
  private aim() {
    let p = this.path.getPoint(this.nextIndex);
    // convert from the point to a unit vector, then set velocity
    p.Subtract(this.rigidBody!.getCenter()).Normalize();
    p.Scale(this.velocity);
    this.rigidBody!.setVelocity(p.x, p.y);
  }

  /** Update the actor to start moving to the next point in the path */
  private goToNext() {
    this.aim();
    if (this.waypointCallback) this.waypointCallback(this.nextIndex - 1);
  }

  /** Is the movement paused?  See `pause()`. */
  private paused = false;

  /** Is the movement paused right now? */
  public get isPaused() { return this.paused; }

  /**
   * Stop the actor where it is, and hold it there until `resume()` is called.
   * It's safe to call this from the `waypointCallback`, so that an actor can
   * stop when it reaches a waypoint.
   */
  public pause() {
    if (this.paused) return;
    this.paused = true;
    this.rigidBody?.setVelocity(0, 0);
  }

  /**
   * Carry on toward the next waypoint, from wherever the actor is now.  Does
   * nothing if the movement isn't paused.  The `waypointCallback` is not run
   * again for the waypoint that the actor stopped at.
   */
  public resume() {
    if (!this.paused) return;
    this.paused = false;
    if (!this.done && this.rigidBody) this.aim();
  }

  /** Begin running a path */
  private start() {
    if (!this.rigidBody) return;
    // move to the starting point
    let transform = new b2Transform().SetPositionAngle(this.path.getPoint(0), this._rigidBody!.body.GetAngle());
    this.rigidBody.body.SetTransform(transform);
    // set up our next goal, start moving toward it
    this.nextIndex = 1;
    this.goToNext();
  }

  /**
   * Create a policy for moving an actor along a fixed path
   *
   * @param cfg.path              The path on which to move
   * @param cfg.velocity          The speed at which the actor should move
   * @param cfg.loop              Should the path repeat infinitely, or just
   *                               run once?
   * @param cfg.waypointCallback  Code to run each time a waypoint of the path
   *                               is reached.  It will be given the index of
   *                               the *next* waypoint.
   * @param cfg.startPoint        The point on the path from which to start
   */
  constructor(cfg: { path: Path, velocity: number, loop: boolean, waypointCallback?: (which: number) => void, startPoint?: number }) {
    this.path = cfg.path;
    this.velocity = cfg.velocity;
    this.loop = cfg.loop;
    this.waypointCallback = cfg.waypointCallback;
    // NB: We don't call halt()/start() here -- both are no-ops until
    // `rigidBody` is actually attached (see its setter below), which
    // hasn't happened yet at construction time.  It re-runs this same
    // `path.length < 2` check itself once a body is attached.
    if (cfg.path.length < 2) stage.console.log("Error: path must have at least two points");
    if (cfg.startPoint !== undefined) this.onFirstRender = () => this.skip_to(cfg.startPoint!);
  }

  /** Figure out where we need to go next when driving a path */
  prerender(_elapsedMs: number, _camera: CameraService) {
    // quit if we're done and we don't loop
    if (this.done || this.paused || !this.rigidBody) return;

    if (this.onFirstRender) {
      this.onFirstRender();
      this.onFirstRender = undefined;
    }

    // if we haven't passed the next goal, don't set up a new goal
    let total = this.path.getPoint(this.nextIndex - 1).Subtract(this.path.getPoint(this.nextIndex));
    let sofar = this.path.getPoint(this.nextIndex - 1).Subtract(this.rigidBody.getCenter())
    if (total.x > 0 && total.x > sofar.x) return; // actor right of right goal
    else if (total.x < 0 && total.x < sofar.x) return; // actor left of left goal
    if (total.y > 0 && total.y > sofar.y) return; // actor above down goal
    else if (total.y < 0 && total.y < sofar.y) return; // actor below up goal

    // Update the goal, and restart, stop, or start moving toward it
    this.nextIndex++;
    if (this.nextIndex == this.path.length) {
      if (this.loop) this.start(); // start over for the looping case
      else this.halt(); // halt the path for the non-looping case
      return;
    }
    this.goToNext(); // Not at end, so move to next
  }
}

/** A rule for moving based on Tilt / Accelerometer  */
export class TiltMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public set rigidBody(body: RigidBodyComponent | undefined) {
    this._rigidBody = body;
    // this must be a dynamic body, so that forces will work on it
    if (this.rigidBody?.body.GetType() != b2BodyType.b2_dynamicBody) {
      stage.console.log(`Warning: You have attached a TiltMovement to an actor whose body is not dynamic.  Switching to dynamic.\n ${Error().stack}`);
      this.rigidBody?.body.SetType(b2BodyType.b2_dynamicBody);
    }
  }
  /** The RigidBodyComponent to which this movement is attached */
  public get rigidBody() { return this._rigidBody; }
  /** The RigidBodyComponent to which this movement is attached */
  private _rigidBody?: RigidBodyComponent;

  /** Construct a policy for moving an actor via tilt */
  constructor() { stage.tilt.addTiltActor(this); }

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, _camera: CameraService) { }
}

/** A rule for moving by chasing some other actor */
export class ChaseMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public set rigidBody(body: RigidBodyComponent | undefined) {
    this._rigidBody = body;
    // This cannot be a static body
    if (this.rigidBody?.body.GetType() == b2BodyType.b2_staticBody) {
      stage.console.log(`Warning: You have attached a ChaseMovement to an actor with a static body.  Switching to kinematic.\n ${Error().stack}`);
      this.rigidBody.body.SetType(b2BodyType.b2_kinematicBody);
    }
  }
  /** The RigidBodyComponent to which this movement is attached */
  public get rigidBody() { return this._rigidBody; }
  /** The RigidBodyComponent to which this movement is attached */
  private _rigidBody?: RigidBodyComponent;

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, _camera: CameraService) {
    // This code only works if we've got a body, the target has a body, and both
    // are enabled
    if (!this.rigidBody || !this.target.rigidBody) return;
    if (!this.target.enabled) return;

    // compute vector between actors, and normalize it
    let x = this.target.rigidBody!.body.GetPosition().x - this.rigidBody.body.GetPosition().x;
    let y = this.target.rigidBody!.body.GetPosition().y - this.rigidBody.body.GetPosition().y;
    let denom = Math.sqrt(x * x + y * y);
    // If the chaser and target are exactly on top of each other, there's no
    // direction to normalize toward -- leave velocity alone this tick,
    // rather than dividing by zero and setting a NaN velocity.
    if (denom === 0) return;
    x /= denom;
    y /= denom;

    // multiply by speed
    x *= this.speed;
    y *= this.speed;

    // remove changes for disabled directions, and boost the other
    // dimension a little bit
    if (!this.chaseInX) {
      x = this.rigidBody.body.GetLinearVelocity().x;
      y *= this.multiplier;
    }
    if (!this.chaseInY) {
      y = this.rigidBody.body.GetLinearVelocity().y;
      x *= this.multiplier;
    }
    // apply velocity
    this.rigidBody?.setVelocity(x, y);
  }

  /** The actor to chase */
  private target: Actor;
  /** The speed at which to chase the actor */
  private speed: number;
  /** Should it chase in the X dimension */
  private chaseInX: boolean;
  /** Should it chase in the Y dimension */
  private chaseInY: boolean;
  /** A multiplier for the speed */
  private multiplier: number = 2;

  /**
   * Specify that this actor is supposed to chase another actor
   *
   * @param cfg.speed       The speed with which it chases the other actor
   * @param cfg.target      The actor to chase
   * @param cfg.chaseInX    Optional: Should the actor change its x velocity?
   * @param cfg.chaseInY    Optional: Should the actor change its y velocity?
   * @param cfg.multiplier  Optional scaling factor for changing how fast the
   *                        actor chases (default is 2) (useful when chaseInX or
   *                        chaseInY is false)
   */
  constructor(cfg: { speed: number, target: Actor, chaseInX?: boolean, chaseInY?: boolean, multiplier?: number }) {
    this.speed = cfg.speed;
    this.target = cfg.target;
    this.chaseInX = cfg.chaseInX == undefined ? true : cfg.chaseInX;
    this.chaseInY = cfg.chaseInY == undefined ? true : cfg.chaseInY;
    this.multiplier = (cfg.multiplier == undefined) ? 2 : cfg.multiplier;
  }
}

/** A rule for hovering at a fixed camera position */
export class HoverMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public rigidBody?: RigidBodyComponent;

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, camera: CameraService) {
    if (!this.rigidBody) return;
    if (!this.hover) return;
    let pmr = stage.pixelMeterRatio;
    this.hover.Set(this.screenX * pmr, this.screenY * pmr);
    let a = camera.screenToMeters({ x: this.hover.x, y: this.hover.y });
    this.hover.Set(a.x, a.y);
    let transform = new b2Transform();
    transform.SetPositionAngle(this.hover, this.rigidBody.body.GetAngle());
    this.rigidBody.body.SetTransform(transform);
  }

  /** The X coordinate (in screen pixels, not meters) where the actor should appear */
  private screenX: number;
  /** The Y coordinate (in screen pixels, not meters) where the actor should appear */
  private screenY: number;

  /**
   * Indicate that this actor should hover at a specific location on the screen,
   * rather than being placed at some point on the level itself. Note that the
   * coordinates to this command are the center position of the hovering actor.
   * Also, be careful about using hover with zoom... hover is relative to screen
   * coordinates (pixels, unlike almost everywhere else in JetLag, which uses
   * meters), not world coordinates, so it's going to look funny to use this
   * with zoom
   *
   * @param cfg.screenX The X coordinate (in screen pixels) where the actor
   *                    should appear
   * @param cfg.screenY The Y coordinate (in screen pixels) where the actor
   *                    should appear
   */
  constructor(cfg: { screenX: number, screenY: number }) {
    this.screenX = cfg.screenX;
    this.screenY = cfg.screenY;
    let pmr = stage.pixelMeterRatio;
    this.hover = new b2Vec2(cfg.screenX * pmr, cfg.screenY * pmr);
  }

  /** A vector for computing hover placement */
  private hover?: b2Vec2;
}

/**
 * Toss a projectile. This is for tossing in a single, predetermined
 * direction.  This method just handles movement.  You shouldn't call it on
 * your own.  Use ThrowableBehavior's tossFixedDir() method instead.
 *
 * @param actor     The projectile actor being tossed
 * @param fromX     The initial X position
 * @param fromY     The initial Y position
 * @param velocityX The X velocity of the projectile when it is tossed
 * @param velocityY The Y velocity of the projectile when it is tossed
 */
export function tossFixedDir(actor: Actor, fromX: number, fromY: number, velocityX: number, velocityY: number) {
  // Move the projectile and give it velocity
  let transform = new b2Transform();
  transform.SetPositionAngle(new b2Vec2(fromX, fromY), 0);
  actor.rigidBody.body.SetTransform(transform);
  actor.rigidBody.setVelocity(velocityX, velocityY);
}

/**
 * Toss a projectile. This is for tossing in the direction of a specified point.
 * This method just handles movement.  You shouldn't call it on your own.  Use
 * ThrowableBehavior's tossAt() method instead.
 *
 * @param actor               The projectile actor being tossed
 * @param rangeFromX          X coordinate of the point where the projectile
 *                            should actually spawn (the actor's center plus its
 *                            offset)
 * @param rangeFromY          Y coordinate of the point where the projectile
 *                            should actually spawn (the actor's center plus its
 *                            offset)
 * @param fromX               X coordinate of the center of the actor doing the
 *                            toss
 * @param fromY               Y coordinate of the center of the actor doing the
 *                            toss
 * @param toX                 X coordinate of the point at which to toss
 * @param toY                 Y coordinate of the point at which to toss
 * @param offsetX             The x distance between the center of the
 *                            projectile and the center of the actor tossing the
 *                            projectile
 * @param offsetY             The y distance between the center of the
 *                            projectile and the center of the actor tossing the
 *                            projectile
 * @param multiplier          A multiplier on projectile speed
 * @param fixedVectorVelocity A fixed velocity for all projectiles
 * @param rotateVectorToss    Should projectiles be rotated in the direction
 *                            they are tossed?
 */
export function tossAt(actor: Actor, rangeFromX: number, rangeFromY: number, fromX: number, fromY: number, toX: number, toY: number, offsetX: number, offsetY: number, multiplier: number = 1, fixedVectorVelocity?: number, rotateVectorToss?: boolean) {
  let transform = new b2Transform();
  transform.SetPositionAngle(new b2Vec2(rangeFromX, rangeFromY), 0);
  actor.rigidBody.body.SetTransform(transform);

  // give the projectile velocity
  let dX = toX - fromX - offsetX;
  let dY = toY - fromY - offsetY;
  if (fixedVectorVelocity != undefined) {
    // compute a unit vector
    let hypotenuse = Math.sqrt(dX * dX + dY * dY);
    let tmpX = dX / hypotenuse;
    let tmpY = dY / hypotenuse;
    // multiply by fixed velocity
    tmpX *= fixedVectorVelocity!;
    tmpY *= fixedVectorVelocity!;
    actor.rigidBody.setVelocity(tmpX, tmpY);
  }
  else {
    // compute absolute vector, multiply by dampening factor
    let tmpX = dX * multiplier;
    let tmpY = dY * multiplier;
    actor.rigidBody.setVelocity(tmpX, tmpY);
  }

  // rotate the projectile
  if (rotateVectorToss) {
    let angle = Math.atan2(toY - fromY - offsetY, toX - fromX - offsetX) - Math.atan2(-1, 0);
    actor.rigidBody.rotation = angle;
  }
}

/** A rule for how projectiles move */
export class ProjectileMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public set rigidBody(body: RigidBodyComponent | undefined) {
    this._rigidBody = body;
    // this can't be a static body
    if (!this.rigidBody) return;
    if (this.rigidBody.body.GetType() == b2BodyType.b2_staticBody) {
      stage.console.log(`Warning: You have attached a ProjectileMovement to an actor with a static body.  Switching to kinematic.\n ${Error().stack}`);
      this.rigidBody?.body.SetType(b2BodyType.b2_kinematicBody);
    }
    this.rigidBody.body.SetBullet(true);
    this.rigidBody.setRotatable(false);
  }
  /** The RigidBodyComponent to which this movement is attached */
  public get rigidBody() { return this._rigidBody; }
  /** The RigidBodyComponent to which this movement is attached */
  private _rigidBody?: RigidBodyComponent;

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, _camera: CameraService) { }
}

/** A rule for things that move, detect collisions, and experience forces */
export class DynamicBodyMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public set rigidBody(body: RigidBodyComponent | undefined) {
    this._rigidBody = body;
    this.rigidBody?.body.SetType(b2BodyType.b2_dynamicBody);
  }
  /** The RigidBodyComponent to which this movement is attached */
  public get rigidBody() { return this._rigidBody; }
  /** The RigidBodyComponent to which this movement is attached */
  private _rigidBody?: RigidBodyComponent;

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, _camera: CameraService) { }
}

/**
 * A rule for things that move, but don't detect collisions or experience forces
 */
export class KinematicBodyMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public set rigidBody(body: RigidBodyComponent | undefined) {
    this._rigidBody = body;
    this.rigidBody?.body.SetType(b2BodyType.b2_kinematicBody);
  }
  /** The RigidBodyComponent to which this movement is attached */
  public get rigidBody() { return this._rigidBody; }
  /** The RigidBodyComponent to which this movement is attached */
  private _rigidBody?: RigidBodyComponent;

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, _camera: CameraService) { }
}

/** A rule for things that don't actually move or detect collisions */
export class StaticBodyMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public set rigidBody(body: RigidBodyComponent | undefined) {
    this._rigidBody = body;
    this.rigidBody?.body.SetType(b2BodyType.b2_staticBody);
  }
  /** The RigidBodyComponent to which this movement is attached */
  public get rigidBody() { return this._rigidBody; }
  /** The RigidBodyComponent to which this movement is attached */
  private _rigidBody?: RigidBodyComponent;

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, _camera: CameraService) { }
}

/** This rule says "just stick with the body type that you've already got" */
export class PassThroughMovement {
  /** The RigidBodyComponent to which this movement is attached */
  public rigidBody?: RigidBodyComponent;

  /** Do any last-minute adjustments related to the movement */
  prerender(_elapsedMs: number, _camera: CameraService) { }
}

/** MovementComponent is the type of any movement rules that an Actor can have */
export type MovementComponent = PathMovement | TiltMovement | ChaseMovement | HoverMovement | ProjectileMovement | DynamicBodyMovement | KinematicBodyMovement | StaticBodyMovement | PassThroughMovement;
