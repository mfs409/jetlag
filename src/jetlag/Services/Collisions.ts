import { b2AABB, b2Contact, b2ContactImpulse, b2DistanceJoint, b2DistanceJointDef, b2Fixture, b2Manifold, b2Vec2, b2World, b2WorldManifold } from "@box2d/core";
import { Actor, actorFromBody } from "../Entities/Actor";
import { Scene } from "../Entities/Scene";
import { DIRECTION } from "../Components/StateManager";
import { CollisionExemptions, dispatchCollision, dispatchProximityEnd, dispatchProximityStart, dispatchPunchContact, relativeZone } from "../Components/Behavior";
import { stage } from "../Stage";

/**
 * PointToActorCallback queries the world to find the actor at a given
 * coordinate
 */
class PointToActorCallback {
  /** If we found any actors, we'll put them here */
  foundEntities: Actor[] = [];

  /** A helper vector for tracking the location that is being queried */
  private readonly touchVector = new b2Vec2(0, 0);

  /** The tolerance (in meters) when looking in a region around a point */
  private readonly tolerance = 0.1;

  /** The bounding box around the point that is being tested */
  private readonly aabb = new b2AABB();

  /**
   * When query() finds a rigidBody, we may not want to return it.  This makes a
   * more refined decision by seeing if the found body is Active
   *
   * @param fixture The fixture that was found, and which needs to be tested
   *
   * @returns True if the fixture isn't satisfactory, and the search should
   *          continue
   */
  private checkIfActive(fixture: b2Fixture) {
    // Make sure the fixture's Entity is active
    let b = actorFromBody(fixture.GetBody());
    if (!b || !b.enabled) return true;
    // A proximity or punch fixture is not the actor's real shape -- neither
    // should count as "the actor is at this point" for taps/gestures.
    // Skipping them here also avoids pushing the same actor twice, since a
    // body with an extra fixture gets this callback once per fixture, not
    // once per body.
    if (fixture === b.rigidBody?.proximityFixture) return true;
    if (fixture === b.rigidBody?.punchFixture) return true;
    // It's active, so save the Entity
    this.foundEntities.push(b);
    return true;
  }

  /**
   * See if there is an Entity at point (x, y)
   *
   * @param pt    The point that is being checked
   * @param world The world in which the check is happening
   */
  query(pt: { x: number, y: number }, world: b2World) {
    this.foundEntities.length = 0;
    this.touchVector.Set(pt.x, pt.y);
    this.aabb.lowerBound.Set(pt.x - this.tolerance, pt.y - this.tolerance);
    this.aabb.upperBound.Set(pt.x + this.tolerance, pt.y + this.tolerance);
    world.QueryAABB(this.aabb, (fix: b2Fixture) => this.checkIfActive(fix));
  }
}

/**
 * BasicCollisionService is a physics simulator that is suitable for the HUD and
 * overlays.  It lacks a few complex/expensive features that might be desired in
 * a playable level of a game.
 */
export class BasicCollisionService {
  /** The physics world in which all actors interact */
  readonly world = b2World.Create(new b2Vec2(0, 0));

  /** For querying the point that was touched */
  protected readonly pointQuerier = new PointToActorCallback();

  /**
   * Query to find the actors at a screen coordinate
   *
   * @param coords.x  The X coordinate (in meters) to look up
   * @param coords.y  The Y coordinate (in meters) to look up
   */
  public actorsAt(coords: { x: number, y: number }) {
    this.pointQuerier.query(coords, this.world);
    return this.pointQuerier.foundEntities;
  }
}

/**
 * ContactListener wraps up all of the functions that Box2D needs in order to
 * run custom code on a collision event.  Strictly speaking, it is supposed to
 * extend the b2ContactListener type, but b2ContactListener doesn't have any
 * default implementations (meaning it ought to be an interface), and using a
 * flat class hierarchy works slightly better for the way we build tutorials, so
 * we omit the `extends` clause.
 */
class ContactListener {
  /**
   * Create a contact listener by saving the scene and collision service
   */
  constructor(private scene: Scene, private collisionService: AdvancedCollisionService) { /*super();*/ }

  /**
   * Figure out what to do when two bodies start to collide
   *
   * @param contact A description of the contact event
   */
  public BeginContact(contact: b2Contact) {
    // Get the bodies, make sure both are actors
    const fixA = contact.GetFixtureA(), fixB = contact.GetFixtureB();
    let a = actorFromBody(fixA.GetBody());
    let b = actorFromBody(fixB.GetBody());
    if (!a || !b) return;

    // A proximity fixture never participates in normal collision dispatch
    // (or the begin/end contact handler system below) -- it's a purely
    // informational "something is nearby" zone.  Each actor's proximity
    // zone (if it has one) is notified independently, since there's
    // nothing to claim/contest the way a real collision might have.
    const aIsProximity = fixA === a.rigidBody?.proximityFixture;
    const bIsProximity = fixB === b.rigidBody?.proximityFixture;
    if (aIsProximity || bIsProximity) {
      this.scene.oneTimeEvents.push(() => {
        if (aIsProximity) dispatchProximityStart(a, b);
        if (bIsProximity) dispatchProximityStart(b, a);
      });
      return;
    }

    // A punch fixture is handled entirely separately too: it's routed
    // straight to the puncher's own PunchBehavior, not the normal
    // claim-and-short-circuit dispatch below, since a punch is the
    // puncher's own body reacting to its own extra fixture, not a contact
    // between two independent actors' main shapes.
    const aIsPunch = fixA === a.rigidBody?.punchFixture;
    const bIsPunch = fixB === b.rigidBody?.punchFixture;
    if (aIsPunch || bIsPunch) {
      this.scene.oneTimeEvents.push(() => {
        if (aIsPunch) dispatchPunchContact(a, b);
        if (bIsPunch) dispatchPunchContact(b, a);
      });
      return;
    }

    // Check for begin contact handlers
    const handler = this.collisionService.getBeginContactHandler(a, b);
    if (handler && handler.length > 0) {
      handler.forEach(callback => {
        this.scene.oneTimeEvents.push(() => callback(a, b))
      });
    }

    // The world is in mid-render, so we can't really change anything, so
    // defer handling the event until after the next render.
    this.scene.oneTimeEvents.push(() => {
      // Deterministic tie-break: whichever actor has the lower id is given the
      // first chance to react
      let first = a.id < b.id ? a : b;
      let second = first === a ? b : a;
      if (!dispatchCollision(first, second)) dispatchCollision(second, first);
    });
  }

  /**
   * Figure out what to do when two bodies stop being in contact with each
   * other
   *
   * @param contact A description of the contact event
   */
  public EndContact(contact: b2Contact) {
    // Get the bodies, make sure both are actors
    const fixA = contact.GetFixtureA(), fixB = contact.GetFixtureB();
    let a = actorFromBody(fixA.GetBody());
    let b = actorFromBody(fixB.GetBody());
    if (!a || !b) return;

    // See BeginContact's comment: proximity fixtures are handled entirely
    // separately from the endContactHandlers system below.
    const aIsProximity = fixA === a.rigidBody?.proximityFixture;
    const bIsProximity = fixB === b.rigidBody?.proximityFixture;
    if (aIsProximity || bIsProximity) {
      this.scene.oneTimeEvents.push(() => {
        if (aIsProximity) dispatchProximityEnd(a, b);
        if (bIsProximity) dispatchProximityEnd(b, a);
      });
      return;
    }

    // A punch hitbox has no "end" concept -- it's a one-shot hit, not an
    // enter/exit zone -- so just skip the endContactHandlers system below
    // for it, the same way proximity fixtures do.
    if (fixA === a.rigidBody?.punchFixture || fixB === b.rigidBody?.punchFixture) return;

    // If this pair is in the array, splice it out and run the array entry.
    //
    // NB: Iterate over a copy, not `endContactHandlers` itself -- splicing
    //     out of the array while a `for...of` walks it shifts later entries
    //     left, which can skip a second handler registered for this same
    //     pair, leaving it stuck in the array forever.
    for (let ch of [...this.collisionService.endContactHandlers])
      if ((ch.actor1 == a && ch.actor2 == b) || (ch.actor1 == b && ch.actor2 == a)) {
        let i = this.collisionService.endContactHandlers.indexOf(ch);
        this.collisionService.endContactHandlers.splice(i, 1);
        // The world is in mid-render, so we can't really change anything, so
        // defer handling the event until after the next render.
        this.scene.oneTimeEvents.push(() => {
          ch.callback(ch.actor1, ch.actor2);
        });
      }
  }

  /**
   * Before handling a collision, PreSolve runs.  We can use it to disable
   * certain contacts
   *
   * @param contact     A description of the contact event
   * @param oldManifold The manifold from the previous world step
   */
  public PreSolve(contact: b2Contact, _oldManifold: b2Manifold) {
    // get the bodies, make sure both are actors
    let a = actorFromBody(contact.GetFixtureA().GetBody());
    let b = actorFromBody(contact.GetFixtureB().GetBody());
    if (!a || !b || !a.rigidBody || !b.rigidBody) return;
    let ab = a.rigidBody, bb = b.rigidBody;

    // is either one-sided?
    let oneSided: Actor | undefined = undefined;
    let other: Actor | undefined = undefined;
    if (ab.singleRigidSide != undefined) {
      oneSided = a; other = b;
    } else if (bb.singleRigidSide != undefined) {
      oneSided = b; other = a;
    }
    // Should we disable a one-sided collision?  Skip this if `oneSided` and
    // `other` are already stuck together via a sticky joint -- not if
    // *either* has a joint to some unrelated third actor -- since a joint
    // between this specific pair already dictates their relationship, and
    // fighting it with a direction-based enable/disable would be wrong.
    const jointsThisPair = (rider: Actor, anchor: Actor) => rider.rigidBody?.stickyDistJoint?.GetBodyA() === anchor.rigidBody?.body;
    const alreadyStuckTogether = oneSided && other && (jointsThisPair(other, oneSided) || jointsThisPair(oneSided, other));
    // NB: This doesn't use `relativeZone`, even though it's classifying a
    // direction between two actors just like `relativeZone` does.
    // `relativeZone` is a coarse center-to-center check with no notion of
    // size or velocity, but a one-way platform needs both: edge overlap (so
    // a wide platform's corners resolve correctly, not just "which side of
    // center"), and direction of travel (so you can jump up through it, but
    // still land on top of it).  Neither is expressible as a zone lookup.
    if (oneSided && other && !alreadyStuckTogether) {
      let ot = oneSided.rigidBody.getCenter().y - oneSided.rigidBody.h / 2;
      let ob = oneSided.rigidBody.getCenter().y + oneSided.rigidBody.h / 2;
      let ol = oneSided.rigidBody.getCenter().x - oneSided.rigidBody.w / 2;
      let or = oneSided.rigidBody.getCenter().x + oneSided.rigidBody.w / 2;
      let ct = other.rigidBody.getCenter().y - other.rigidBody.h / 2;
      let cb = other.rigidBody.getCenter().y + other.rigidBody.h / 2;
      let cl = other.rigidBody.getCenter().x - other.rigidBody.w / 2;
      let cr = other.rigidBody.getCenter().x + other.rigidBody.w / 2;
      let vx = other.rigidBody.getVelocity().x;
      let vy = other.rigidBody.getVelocity().y;
      if (oneSided.rigidBody!.singleRigidSide == DIRECTION.N && cb >= ot && vy <= 0) contact.SetEnabled(false);
      else if (oneSided.rigidBody!.singleRigidSide == DIRECTION.W && cr >= ol && vx <= 0) contact.SetEnabled(false);
      else if (oneSided.rigidBody!.singleRigidSide == DIRECTION.E && cl <= or && vx >= 0) contact.SetEnabled(false);
      else if (oneSided.rigidBody!.singleRigidSide == DIRECTION.S && ct <= ob && vy >= 0) contact.SetEnabled(false);
    }

    // If either entity is sticky, give it a chance to make them stick.
    // Check both, not just whichever qualifies first: handleSticky() is a
    // no-op if this contact's zone doesn't match any of that entity's
    // sticky sides, and in that case, the other entity's own stickiness (if
    // any) still deserves a chance.
    let stickyHandled = false;
    if (ab.stickySides.length > 0) { this.collisionService.handleSticky(a, b, contact); stickyHandled = true; }
    if (bb.stickySides.length > 0) { this.collisionService.handleSticky(b, a, contact); stickyHandled = true; }
    if (stickyHandled) return;

    // if the entities have a matching passthrough ID
    if (ab.passThroughId && bb.passThroughId) {
      if (ab.passThroughId.some(i1 => bb.passThroughId!.includes(i1))) {
        contact.SetEnabled(false);
        return;
      }
    }

    // if any of either actor's Behaviors have a special exemption to keep
    // them from interacting with any of the other actor's Behaviors, then
    // disable the contact.  (An actor can carry several Behaviors now, so
    // this checks every pair, not just one Behavior per side.)
    const intersects = (ignores: CollisionExemptions[], properties: CollisionExemptions[]) => ignores.some(p => properties.includes(p));
    for (let ba of a.behaviors) {
      for (let bBeh of b.behaviors) {
        if (intersects(ba.collisionRules.ignores, bBeh.collisionRules.properties) ||
          intersects(bBeh.collisionRules.ignores, ba.collisionRules.properties)) {
          contact.SetEnabled(false);
          return;
        }
      }
    }
    // If we get here, it's a real collision
  }

  /**
   * This runs after handling the collision.  Right now we don't use it.
   *
   * @param contact A description of the contact event
   * @param impulse The impulse of the contact
   */
  public PostSolve(_contact: b2Contact, _impulse: b2ContactImpulse) { }
}

/**
 * AdvancedCollisionService is a physics simulator that provides the ability to run
 * code in response to collisions.
 */
export class AdvancedCollisionService extends BasicCollisionService {
  /**
   * Callbacks to consider running in response to a contact *ending*.  These are
   * always one-time callbacks.
   *
   * NB:  This could become a performance bottleneck, since we're using an array
   *      with O(n) search overhead.  The assumption is that the array will be
   *      small.  If that changes, then this will need to be redesigned.
   */
  public endContactHandlers: { actor1: Actor, actor2: Actor, callback: (a: Actor, b: Actor) => void }[] = [];

  /**
   * Callbacks to consider running in response to a contact *beginning*.
   * Unlike endContactHandlers, these are keyed by actor pair, and persist
   * until explicitly removed via removeBeginContactHandler.
   */
  public beginContactHandlers: WeakMap<Actor, Map<Actor, ((a: Actor, b: Actor) => void)[]>> = new WeakMap();

  /** Provide a scene, so we can route collision events to it */
  public setScene(scene: Scene) { this.configureCollisionHandlers(scene); }

  /**
   * Register a new endContactHandler to run when a collision ends
   *
   * @param actor1    One of the actors of the collision.  This actor should be
   *                  the first argument to `callback`.
   * @param actor2    The other actor from the collision / the second argument
   *                  to `callback`.
   * @param callback  The code to run when the collision ends
   */
  public addEndContactHandler(actor1: Actor, actor2: Actor, callback: (a: Actor, b: Actor) => void) {
    this.endContactHandlers.push({ actor1, actor2, callback });
  }

  /**
   * Register a new beginContactHandler to run when a collision begins
   *
   * @param actor1    One actor of the collision
   * @param actor2    Another actor of the collision
   * @param callback  The code to run when the collision begins
   */
  public addBeginContactHandler(actor1: Actor, actor2: Actor, callback: (a: Actor, b: Actor) => void) {
    this.addOneDirectionalBeginContactHandler(actor1, actor2, callback);
    this.addOneDirectionalBeginContactHandler(actor2, actor1, callback);
  }

  /**
   * Register `callback` under `from`'s entry in `beginContactHandlers`, for
   * contacts with `to`.  Shared by `addBeginContactHandler`, which calls
   * this once per direction of the pair.
   *
   * @param from      The actor under whose entry the callback is registered
   * @param to        The other actor of the collision
   * @param callback  The code to run when the collision begins
   */
  private addOneDirectionalBeginContactHandler(from: Actor, to: Actor, callback: (a: Actor, b: Actor) => void) {
    if (!this.beginContactHandlers.has(from)) this.beginContactHandlers.set(from, new Map());
    const inner = this.beginContactHandlers.get(from)!;
    if (!inner.has(to)) inner.set(to, []);
    inner.get(to)!.push(callback);
  }

  /**
   * Remove begin contact handler(s) for a pair of actors
   *
   * @param actor1  One actor of the collision
   * @param actor2  Another actor of the collision
   * @param index   If provided, remove only the handler at this index in
   *                each actor's callback list.  If omitted, remove all
   *                handlers registered between actor1 and actor2.
   *
   * @returns True if actor1 and actor2 specifically had a begin contact
   *          handler registered between them (and thus something was
   *          actually removed), false otherwise.
   */
  public removeBeginContactHandler(actor1: Actor, actor2: Actor, index?: number) {
    const handlers = this.beginContactHandlers.get(actor1)?.get(actor2);
    if (!handlers) return false;
    if (index !== undefined) {
      if (index < 0 || index >= handlers.length) return false;
      handlers.splice(index, 1);
      this.beginContactHandlers.get(actor2)?.get(actor1)?.splice(index, 1);
      return true;
    }
    else {
      this.beginContactHandlers.get(actor1)?.delete(actor2);
      this.beginContactHandlers.get(actor2)?.delete(actor1);
      return true;
    }
  }

  /**
   * @param actor1 The first actor of the collision
   * @param actor2 The second actor of the collision
   * @returns An array of callbacks to be executed by the collision, or
   *          undefined if none are registered
   */
  public getBeginContactHandler(actor1: Actor, actor2: Actor) {
    return this.beginContactHandlers.get(actor1)?.get(actor2) || this.beginContactHandlers.get(actor2)?.get(actor1);
  }

  /** Configure collision handling for the current level */
  private configureCollisionHandlers(scene: Scene) {
    this.world.SetContactListener(new ContactListener(scene, this));
  }

  /**
   * When an actor collides with a "sticky" actor, this figures out what to do
   *
   * @param sticky  The sticky actor 
   * @param other   The other actor
   * @param contact A description of the contact event
   */
  public handleSticky(sticky: Actor, other: Actor, contact: b2Contact) {
    // don't create a joint if we've already got one
    if (other.rigidBody?.stickyDistJoint) return;
    // don't create a joint if the sticky entity's own re-stick cooldown
    // (started by breakStickyJoints() the last time something unstuck from
    // it) hasn't elapsed yet
    if (stage.renderer.now < (sticky.rigidBody?.stickyUntilMs ?? 0)) return;
    // only do something if we're hitting the actor from the correct direction
    let sBody = sticky.rigidBody!;
    if (sBody.stickySides.includes(relativeZone(sticky, other))) {
      // create a distance joint. Note that we need to make the joint in a
      // callback that runs later
      let m = new b2WorldManifold();
      contact.GetWorldManifold(m);
      let v = m.points[0];
      sticky.scene.oneTimeEvents.push(() => {
        let sb = sticky.rigidBody?.body;
        let ob = other.rigidBody?.body;
        if (!sb || !ob) return;
        ob?.SetLinearVelocity(new b2Vec2(0, 0));
        let d = new b2DistanceJointDef();
        d.Initialize(sb, ob, v, v);
        d.collideConnected = true;
        other.rigidBody!.stickyDistJoint = this.world.CreateJoint(d) as b2DistanceJoint;
      });
    }
  }
}
