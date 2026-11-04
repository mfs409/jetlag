import { b2Vec2 } from "@box2d/core";
import { Actor } from "../Entities/Actor";
import { stage } from "../Stage";
import { SpriteLocation } from "../Devices/Renderer";

/**
 * The Camera is used to determine /how much/ of a world to render, and /which
 * part/.  The Camera can have a minimum X and Y coordinate, and a maximum X and
 * Y coordinate.  It also has a zoom factor, and a current center point.
 *
 * The zoom factor and center point give a rectangular region.  The min and max
 * coordinates give another rectangular region.  If the first region is not
 * fully within the second, we shift it so that it is within, and then we only
 * show those things that are within it.
 *
 * Note that the camera center can be changed dynamically, in response to
 * changes in the world to which the camera is attached.
 */
export class CameraService {
  /** Anything in the world that can be rendered */
  private readonly actors: Actor[] = [];

  /** The minimum x coordinate that can be shown (left) */
  private minX: number | undefined;

  /** The minimum y coordinate that can be shown (top) */
  private minY: number | undefined;

  /** The maximum x coordinate that can be shown (right) */
  private maxX: number | undefined;

  /** The maximum y coordinate that can be shown (bottom) */
  private maxY: number | undefined;

  /** The current center point of the camera */
  private readonly center = new b2Vec2(0, 0);

  /** The dimensions of the screen, in pixels */
  private readonly screenDims = new b2Vec2(0, 0);

  /** The visible dimensions of the screen, in meters */
  private readonly scaledVisibleRegionDims = new b2Vec2(0, 0);

  /** The Actor that the camera follows, if any */
  private actorToFollow?: Actor;

  /**
   * When the camera follows an Actor without centering on it, this gives us the
   * difference between the entity and camera
   */
  private readonly cameraOffset = new b2Vec2(0, 0);

  /**
   * Camera lag.  0 means no lag.  A positive number (seconds) indicates how
   * long the camera takes to catch up with whatever it follows.
   */
  private lag = 0;

  /** Where the camera was centered on the last frame, before any shaking */
  private readonly preShakeCenter = new b2Vec2(0, 0);

  /**
   * Has the camera jumped straight to the Actor it follows, since it was last
   * asked to follow one?  With a lag, the camera eases toward its target, so
   * without this the first frame would ease in from wherever the camera
   * happened to be (the top left of the world, say).  The first frame snaps,
   * and every frame after that eases.
   */
  private hasSnapped = false;

  /** How far the camera is currently thrown off center by a shake */
  private readonly shakeOffset = new b2Vec2(0, 0);

  /** How many seconds of shaking are left */
  private shakeLeft = 0;

  /** How many seconds the current shake lasts, in all */
  private shakeTotal = 0;

  /** How far (in meters) the current shake can throw the camera, at first */
  private shakeSize = 0;

  /**
   * Make the camera follow an Actor.  Optionally add an offset to the
   * actor's center, and center the camera on that point instead.  Optionally
   * give a lag, so that the camera eases toward that point instead of staying
   * exactly on it.
   *
   * @param actor      The actor to follow
   * @param offset.dx  Amount of x distance to add to actor center
   * @param offset.dy  Amount of y distance to add to actor center
   * @param lag        How many seconds the camera takes to close most of the
   *                   distance to the point it is following.  The default, 0,
   *                   keeps the camera exactly on that point.
   */
  public setCameraFocus(actor: Actor | undefined, offset: { dx: number, dy: number } = { dx: 0, dy: 0 }, lag: number = 0) {
    this.actorToFollow = actor;
    this.cameraOffset.Set(offset.dx, offset.dy);
    this.lag = Math.max(0, lag);
    this.hasSnapped = false;
  }

  /**
   * Shake the camera, so that a hit or an explosion can be felt.  The shake
   * starts at the given size and dies down to nothing.  It is applied on top of
   * wherever the camera is, so it works whether or not the camera is following
   * an Actor.  A second shake replaces the first, unless it would be weaker.
   *
   * @param seconds How long the shake lasts
   * @param size    How far, in meters, the camera is thrown at the start
   */
  public shake(seconds: number, size: number) {
    // Don't let a small shake cut short a big one that is still going
    if (this.shakeLeft > 0 && this.shakeSize * (this.shakeLeft / this.shakeTotal) > size) return;
    this.shakeLeft = this.shakeTotal = seconds;
    this.shakeSize = size;
  }

  /**
   * If the world's camera is supposed to follow an Actor, this code will
   * figure out the point on which the camera should center, and will request
   * that the camera center on that point.  It also advances any shake.
   *
   * NB: The camera may decide not to center on that point, depending on zoom
   *     and camera bounds.
   *
   * @param elapsedMs The time in milliseconds since the previous frame
    *
    * @internal
   */
  public adjustCamera(elapsedMs: number = 0) {
    if (this.actorToFollow) {
      // figure out the entity's position + the offset
      let a = this.actorToFollow;
      let x = a.rigidBody.body.GetWorldCenter().x + this.cameraOffset.x;
      let y = a.rigidBody.body.GetWorldCenter().y + this.cameraOffset.y;

      // With a lag, move only part of the way there: the same fraction per
      // second, no matter how fast frames come.  The first frame snaps.
      if (this.lag > 0 && this.hasSnapped) {
        const f = 1 - Math.exp(-elapsedMs / 1000 / this.lag);
        x = this.preShakeCenter.x + (x - this.preShakeCenter.x) * f;
        y = this.preShakeCenter.y + (y - this.preShakeCenter.y) * f;
      }

      // request that the camera center on that point
      this.setCenter({ x, y });
      this.hasSnapped = true;
    }
    this.preShakeCenter.Set(this.center.x, this.center.y);

    // Throw the camera off center, by a bit less each frame
    if (this.shakeLeft > 0) {
      this.shakeLeft = Math.max(0, this.shakeLeft - elapsedMs / 1000);
      const size = this.shakeSize * (this.shakeLeft / this.shakeTotal);
      this.shakeOffset.Set((stage.random.next() * 2 - 1) * size, (stage.random.next() * 2 - 1) * size);
    }
    else {
      this.shakeOffset.Set(0, 0);
    }
  }

  /**
   * Create a CameraService.  It starts out with (0, 0) at the top left corner
    *
    * @internal
   */
  constructor() {
    this.center.Set(stage.screenWidth / stage.pixelMeterRatio / 2, stage.screenHeight / stage.pixelMeterRatio / 2);
    this.resize();
  }

  /** The current zoom factor */
  private _zoom = 1;

  /**
   * How far the camera is zoomed.  1 is the starting view, 2 is twice as close,
   * and 0.5 is twice as far.
   */
  public get zoom(): number { return this._zoom; }
  /** Set how far the camera is zoomed (1 is the starting view), and redraw */
  public set zoom(z: number) {
    this._zoom = z;
    this.resize();
  }

  /**
   * The pixel/meter ratio of the camera.  It is computed from the zoom and the
   * size of the screen, so it works with resizing.
   */
  public get scale(): number { return this._zoom * stage.pixelMeterRatio; }

  /**
   * Update everything that depends on the size of the screen.  The stage calls
   * this when the window changes size.
    *
    * @internal
   */
  public resize() {
    this.screenDims.Set(stage.screenWidth, stage.screenHeight);
    this.scaledVisibleRegionDims.Set(this.screenDims.x / this.scale, this.screenDims.y / this.scale);
    // Keep the view inside the bounds, even though the view just changed size
    this.setCenter({ x: this.center.x, y: this.center.y });
    // Warn if the new scale is too small to fill the screen
    this.checkDims();
  }

  /**
   * Update a camera's bounds by providing a new maximum (X, Y) coordinate
   *
   * @param cfg.minX  The new minimum X value (in meters)
   * @param cfg.minY  The new minimum Y value (in meters)
   * @param cfg.maxX  The new maximum X value (in meters)
   * @param cfg.maxY  The new maximum Y value (in meters)
   */
  public setBounds(cfg: { minX?: number, minY?: number, maxX?: number, maxY?: number }) {
    this.minX = cfg.minX;
    this.minY = cfg.minY;
    this.maxX = cfg.maxX;
    this.maxY = cfg.maxY;
    // Warn if the new bounds are too small to fill the screen
    this.checkDims();
  }

  /**
   * Set the center point on which the camera should focus. If the requested
   * center would push the camera's viewport past the camera's bounds, the
   * center is shifted inward just enough to keep the viewport within bounds,
   * rather than showing empty space past the edge of the world.
   *
   * NB: This is called (indirectly) by the render loop in order to make sure we
   *     don't go out of bounds.
   *
   * @param center.x The X coordinate of the center point (in meters)
   * @param center.y The Y coordinate of the center point (in meters)
   */
  public setCenter(center: { x: number, y: number }) {
    // Make sure that X and Y aren't so close to an edge as to lead to
    // out-of-bounds stuff being rendered (modulo warnings from checkDims())
    let top = center.y - this.scaledVisibleRegionDims.y / 2;
    let bottom = center.y + this.scaledVisibleRegionDims.y / 2;
    let left = center.x - this.scaledVisibleRegionDims.x / 2;
    let right = center.x + this.scaledVisibleRegionDims.x / 2;

    this.center.Set(center.x, center.y);

    if (this.maxY != undefined && bottom > this.maxY)
      this.center.y = this.maxY - this.scaledVisibleRegionDims.y / 2;
    if (this.minY != undefined && top < this.minY)
      this.center.y = this.minY + this.scaledVisibleRegionDims.y / 2;
    if (this.maxX != undefined && right > this.maxX)
      this.center.x = this.maxX - this.scaledVisibleRegionDims.x / 2;
    if (this.minX != undefined && left < this.minX)
      this.center.x = this.minX + this.scaledVisibleRegionDims.x / 2;
  }

  /**
   * Determine whether a circle is within the region being shown by the camera.
   * This is used for culling, to exclude rendering things completely outside
   * the viewport.
   *
   * @param x The X coordinate of the top left corner of the sprite, in meters
   * @param y The Y coordinate of the top left corner of the sprite, in meters
   * @param r The radius of the circumscribing circle
    *
    * @internal
   */
  public inBounds(x: number, y: number, r: number) {
    let leftOk = x + r >= this.getLeft();
    let rightOk = x - r <= this.getRight();
    let topOk = y + r >= this.getTop();
    let bottomOk = y - r <= this.getBottom();
    return leftOk && rightOk && topOk && bottomOk;
  }

  /** Return the X coordinate of the left of the camera viewport */
  public getLeft() { return this.center.x + this.shakeOffset.x - this.scaledVisibleRegionDims.x / 2; }

  /** Return the Y coordinate of the top of the camera viewport */
  public getTop() { return this.center.y + this.shakeOffset.y - this.scaledVisibleRegionDims.y / 2; }

  /** Return the X coordinate of the right of the camera viewport */
  public getRight() { return this.center.x + this.shakeOffset.x + this.scaledVisibleRegionDims.x / 2; }

  /** Return the Y coordinate of the bottom of the camera viewport */
  public getBottom() { return this.center.y + this.shakeOffset.y + this.scaledVisibleRegionDims.y / 2; }

  /**
   * Convert screen coordinates (absolute pixels), to world coordinates (meters)
   *
   * @param screen.x The X coordinate, in pixels
   * @param screen.y The Y coordinate, in pixels
   */
  public screenToMeters(screen: { x: number, y: number }): {
    /** The X coordinate, in meters */
    x: number,
    /** The Y coordinate, in meters */
    y: number
  } {
    return { x: screen.x / this.scale + this.getLeft(), y: screen.y / this.scale + this.getTop() };
  }

  /**
   * Convert world coordinates (meters) to screen coordinates (absolute pixels)
   *
   * @param world.x The X coordinate, in meters
   * @param world.y The Y coordinate, in meters
   */
  public metersToScreen(world: { x: number, y: number }): {
    /** The X coordinate, in pixels */
    x: number,
    /** The Y coordinate, in pixels */
    y: number
  } {
    return { x: (world.x - this.getLeft()) * this.scale, y: (world.y - this.getTop()) * this.scale };
  }

  /**
   * Check to make sure that the current screen bounds, scaled by the current
   * pixel/meter ratio, are at least as big as the screen dimensions.
   *
   * NB: This is a debug-only diagnostic function: it is used by JetLag to print
   * warnings, but it does not interrupt the game.
   */
  private checkDims() {
    if (this.maxX != undefined && this.minX != undefined) {
      let w = this.scale * (this.maxX - this.minX);
      if (Math.round(w) < Math.round(this.screenDims.x)) stage.console.log("Warning, the visible game area is less than the screen width");
    }

    if (this.maxY != undefined && this.minY != undefined) {
      let h = this.scale * (this.maxY - this.minY);
      if (Math.round(h) < Math.round(this.screenDims.y)) stage.console.log("Warning, the visible game area is less than the screen height");
    }
  }

  /**
   * Add an actor to the level
   *
   * @param actor The actor to add
    *
    * @internal
   */
  addActor(actor: Actor) { this.actors.push(actor); }

  /**
   * Render the actors associated with this camera
   *
   * @internal
   */
  render(elapsedMs: number, location: SpriteLocation) {
    // Draw everything
    for (let actor of this.actors)
      if (actor.prerender(elapsedMs))
        for (let a of actor.appearance)
          a.render(this, location);
  }
}
