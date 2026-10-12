import { Actor } from "../Entities/Actor";

/**
 * ActorPool stores a bunch of actors.  We can get into trouble in Box2d if we
 * make too many single-use actors, so the ActorPool is a useful mechanism for
 * recycling / reusing actors.
 */
export class ActorPoolSystem {
  /** A collection of all the available actors */
  private pool = [] as Actor[];

  /** The number of actors waiting in the pool, ready for `get` */
  public get size() { return this.pool.length; }

  /** The number of times `get` may still be called, if a `limit` was set */
  public get remaining() { return this._limit ?? 0; }
  /** Limit how many times `get` may be called */
  public set limit(v: number) { this._limit = v; }
  /** The number of times `get` may still be called */
  private _limit?: number;

  /**
   * Return an actor from the pool, if there is one available.  The actor is
   * likely to be disabled.
   *
   * Note that this can return `undefined`.  If you don't want that behavior,
   * consider adding more actors to the pool.
   */
  public get() {
    // have we reached our limit?
    if (this._limit == 0) return;
    // do we need to decrease our limit?
    if (this._limit != undefined) this._limit--;
    return this.pool.pop();
  }

  /**
   * Place an actor into the pool.  Note that this will disable the actor.
   *
   * @param actor The actor to put into the pool
   */
  public put(actor: Actor) {
    actor.enabled = false;
    this.pool.push(actor);
  }
}
