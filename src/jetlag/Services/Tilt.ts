import { stage } from "../Stage";
import { b2Vec2 } from "@box2d/core";
import { TiltMovement } from "../Components/Movement";

/**
 * TiltService stores the configuration for working with Tilt in a game.  This
 * includes the actors affected by tilt, and the parameters for translating tilt
 * events into physics interactions for those actors.
 */
export class TiltService {
  /** All actors whose behavior should change due to tilt */
  private readonly tiltActors = new Set<TiltMovement>();

  /** Magnitude of the maximum gravity the accelerometer can create */
  readonly tiltMax = new b2Vec2(0, 0);

  /*** Should tilt act as a velocity instead of a force? */
  public tiltVelocityOverride = false;

  /** A multiplier to apply to tilt (accelerometer) readings */
  public tiltMultiplier = 1;

  /** Reset the Tilt Service */
  public reset() {
    this.tiltActors.clear();
    this.tiltMax.Set(0, 0);
    this.tiltVelocityOverride = false;
    this.tiltMultiplier = 1;
  }

  /**
   * Indicate that an actor should be controlled by tilt.
   *
   * @param actor  The TiltMovement component of the actor to start controlling
   *               via tilt
   */
  public addTiltActor(actor: TiltMovement) {
    this.tiltActors.add(actor);
  }

  /**
   * Stop an actor from being controlled by tilt.  Pairs with `addTiltActor`.
   * Call this when an Actor's `movement` is reassigned away from a
   * `TiltMovement`, or the stale registration would otherwise linger for the
   * rest of the level, still being nudged by tilt input even though nothing
   * displays or uses it anymore.
   *
   * @param actor The TiltMovement component to stop controlling via tilt
   */
  public removeTiltActor(actor: TiltMovement) {
    this.tiltActors.delete(actor);
  }

  /**
   * The main render loop calls this to determine what to do when there is a
   * phone tilt
   */
  public handleTilt() {
    // Get accelerometer reading
    let gravity = stage.accelerometer.accel.Clone();
    // Scale it by the multiplier, then clip it to the GravityMax.x/y range
    gravity.Scale(this.tiltMultiplier);
    gravity.x = Math.max(-this.tiltMax.x, Math.min(this.tiltMax.x, gravity.x));
    gravity.y = Math.max(-this.tiltMax.y, Math.min(this.tiltMax.y, gravity.y));

    for (let gfo of this.tiltActors) {
      if (!gfo.rigidBody) continue;
      if (!this.tiltVelocityOverride) gfo.rigidBody.applyForce(gravity.x, gravity.y);
      // if X is clipped to zero, only set Y velocity; if Y is clipped to
      // zero, only set X velocity; otherwise set both
      else if (this.tiltMax.x == 0) gfo.rigidBody.yVelocity = gravity.y;
      else if (this.tiltMax.y == 0) gfo.rigidBody.xVelocity = gravity.x;
      else gfo.rigidBody.setVelocity(gravity.x, gravity.y);
    }
  }
}
