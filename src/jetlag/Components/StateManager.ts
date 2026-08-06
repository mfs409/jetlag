import { Actor } from "../Entities/Actor";

/**
 * The subscribable state of an Actor.  Consists of direction and flags related
 * to moving, tossing, invincibility, jumping, and crawling
 */
export class ActorState {
  /** What direction is the actor facing */
  public direction = DIRECTION.E;
  /** Is the actor moving or idle */
  public moving = false;
  /** Is the actor tossing a projectile */
  public tossing = false;
  /** Is the actor invincible */
  public invincible = false;
  /** Is the actor jumping */
  public jumping = false;
  /** Is the actor crawling */
  public crawling = false;
  /** Is the actor punching */
  public punching = false;
  /** Special tracking for last E/W direction */
  public last_ew = DIRECTION.E;

  /** Make a copy of this ActorState */
  public clone() {
    return Object.assign(new ActorState(), this);
  }
}

/** The directions an actor can face */
export const enum DIRECTION { N, NE, E, SE, S, SW, W, NW };

/**
 * The events that can cause a state to change.  Note that these events can be
 * generated repeatedly (for example, on each time step, an east-moving Entity
 * will re-generate MOVE_E), and multiple can be generated in a single instant
 * (e.g., MOVE_E and MOVE_N), so IStateObservers will need to be careful in
 * handling events.
 */
export const enum StateEvent {
  // Indicate movement (or lack) in each major direction
  MOVE_N, MOVE_NE, MOVE_E, MOVE_SE, MOVE_S, MOVE_SW, MOVE_W, MOVE_NW, STOP,
  // Indicate toss/invincible/jump/crawl/punch happening
  TOSS_Y, TOSS_N, INV_Y, INV_N, JUMP_Y, JUMP_N, CRAWL_Y, CRAWL_N, PUNCH_Y, PUNCH_N,
}

/**
 * The different ActorState combinations for which we might have an animation
 *
 * NB:  JetLag supports a broad set of possible states.  In many games, most of
 *      these won't be useful.
 */
export const enum AnimationState {
  // Stationary
  IDLE_N, IDLE_NE, IDLE_E, IDLE_SE, IDLE_S, IDLE_SW, IDLE_W, IDLE_NW,
  // Moving
  WALK_N, WALK_NE, WALK_E, WALK_SE, WALK_S, WALK_SW, WALK_W, WALK_NW,
  // Stationary + Tossing
  TOSS_IDLE_N, TOSS_IDLE_NE, TOSS_IDLE_E, TOSS_IDLE_SE, TOSS_IDLE_S, TOSS_IDLE_SW, TOSS_IDLE_W, TOSS_IDLE_NW,
  // Moving + Tossing
  TOSS_N, TOSS_NE, TOSS_E, TOSS_SE, TOSS_S, TOSS_SW, TOSS_W, TOSS_NW,
  // Stationary + Invincible
  INV_IDLE_N, INV_IDLE_NE, INV_IDLE_E, INV_IDLE_SE, INV_IDLE_S, INV_IDLE_SW, INV_IDLE_W, INV_IDLE_NW,
  // Moving + Invincible
  INV_N, INV_NE, INV_E, INV_SE, INV_S, INV_SW, INV_W, INV_NW,
  // Stationary + Jumping
  JUMP_IDLE_N, JUMP_IDLE_NE, JUMP_IDLE_E, JUMP_IDLE_SE, JUMP_IDLE_S, JUMP_IDLE_SW, JUMP_IDLE_W, JUMP_IDLE_NW,
  // Moving + Jumping
  JUMP_N, JUMP_NE, JUMP_E, JUMP_SE, JUMP_S, JUMP_SW, JUMP_W, JUMP_NW,
  // Stationary + Crawling
  CRAWL_IDLE_N, CRAWL_IDLE_NE, CRAWL_IDLE_E, CRAWL_IDLE_SE, CRAWL_IDLE_S, CRAWL_IDLE_SW, CRAWL_IDLE_W, CRAWL_IDLE_NW,
  // Moving + Crawling
  CRAWL_N, CRAWL_NE, CRAWL_E, CRAWL_SE, CRAWL_S, CRAWL_SW, CRAWL_W, CRAWL_NW,
  // Stationary + Punching
  PUNCH_IDLE_N, PUNCH_IDLE_NE, PUNCH_IDLE_E, PUNCH_IDLE_SE, PUNCH_IDLE_S, PUNCH_IDLE_SW, PUNCH_IDLE_W, PUNCH_IDLE_NW,
  // Moving + Punching
  PUNCH_N, PUNCH_NE, PUNCH_E, PUNCH_SE, PUNCH_S, PUNCH_SW, PUNCH_W, PUNCH_NW,
}

/**
 * Anything that wants to subscribe to state changes on an Entity must
 * implement this interface.
 */
export interface IStateObserver {
  /**
   * A notification method, for learning of an event that might change an
   * Entity's state
   *
   * @param actor     The actor whose state is changing.
   * @param event     The event that might have caused `actor`'s state to change
   * @param newState  The new state of `actor`
   * @param oldState  The old state of `actor`
   */
  onStateChange(actor: Actor, event: StateEvent, newState: ActorState, oldState: ActorState): void;
}

/**
 * Anything that manages state and must notify others of state changes has one
 * of these, to allow others to register their desire to observe its state
 * changes.
 */
export class StateManagerComponent {
  /** The current state */
  current = new ActorState();

  /** The set of observers of this.current */
  private observers = new Set<IStateObserver>();

  /**
   * Allow an observer to request notification.  Registering the same observer
   * more than once does not cause it to be notified more than once.
   *
   * @param so The state observer to register
   */
  registerObserver(so: IStateObserver) {
    this.observers.add(so);
  }

  /**
   * Stop notifying an observer of state changes.  Pairs with
   * `registerObserver`; safe to call even if `so` was never registered.
   *
   * @param so The state observer to unregister
   */
  unregisterObserver(so: IStateObserver) {
    this.observers.delete(so);
  }

  /**
   * Receive a state-change request and if it is for a new state, pass it to
   * observers
   *
   * @param actor The actor whose state is changing
   * @param event The state change event
   */
  changeState(actor: Actor, event: StateEvent) {
    let changed = false;
    let old = this.current.clone();
    // NB:  StateEvent's MOVE_N..MOVE_NW values line up exactly with DIRECTION's
    //      N..NW values, so a movement event's own number already *is* the
    //      direction it represents.  That lets every MOVE_* case collapse into
    //      one range check, instead of one case per direction.
    if (event <= StateEvent.MOVE_NW) {
      let dir = event as unknown as DIRECTION;
      changed = this.current.direction != dir || !this.current.moving;
      this.current.direction = dir;
      this.current.moving = true;
    } else switch (event) {
      // Stop events just set idle
      case StateEvent.STOP: changed = this.current.moving; this.current.moving = false; break;
      // Toss/Invincible/Jump/Crawl/Punch events just set/clear their
      // corresponding boolean
      case StateEvent.TOSS_Y: changed = !this.current.tossing; this.current.tossing = true; break;
      case StateEvent.TOSS_N: changed = this.current.tossing; this.current.tossing = false; break;
      case StateEvent.INV_Y: changed = !this.current.invincible; this.current.invincible = true; break;
      case StateEvent.INV_N: changed = this.current.invincible; this.current.invincible = false; break;
      case StateEvent.JUMP_Y: changed = !this.current.jumping; this.current.jumping = true; break;
      case StateEvent.JUMP_N: changed = this.current.jumping; this.current.jumping = false; break;
      case StateEvent.CRAWL_Y: changed = !this.current.crawling; this.current.crawling = true; break;
      case StateEvent.CRAWL_N: changed = this.current.crawling; this.current.crawling = false; break;
      case StateEvent.PUNCH_Y: changed = !this.current.punching; this.current.punching = true; break;
      case StateEvent.PUNCH_N: changed = this.current.punching; this.current.punching = false; break;
    }
    // Track the last E/W-ish direction the actor faced, so a side-view game
    // can keep facing that way during a direct N/S move (see
    // AnimatedSprite.sideViewAnimationTransitions).  This is derived purely
    // from `direction`, so StateManagerComponent (the owner of `current`)
    // computes it here, rather than leaving it for an observer (previously
    // AnimatedSprite.onStateChange) to reach into `current` and set it
    // directly on every state change.  N/S movement leaves last_ew as-is.
    if (this.current.direction == DIRECTION.E || this.current.direction == DIRECTION.NE || this.current.direction == DIRECTION.SE)
      this.current.last_ew = DIRECTION.E;
    else if (this.current.direction == DIRECTION.W || this.current.direction == DIRECTION.NW || this.current.direction == DIRECTION.SW)
      this.current.last_ew = DIRECTION.W;

    if (changed) {
      this.observers.forEach((so) => so.onStateChange(actor, event, this.current, old));
    }
  }
}