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
   * Make the camera follow an Actor.  Optionally add an offset to the
   * actor's center, and center the camera on that point instead.
   *
   * @param actor      The actor to follow
   * @param offset.dx  Amount of x distance to add to actor center
   * @param offset.dy  Amount of y distance to add to actor center
   */
  public setCameraFocus(actor: Actor | undefined, offset: { dx: number, dy: number } = { dx: 0, dy: 0 }) {
    this.actorToFollow = actor;
    this.cameraOffset.Set(offset.dx, offset.dy);
  }

  /**
   * If the world's camera is supposed to follow an Actor, this code will
   * figure out the point on which the camera should center, and will request
   * that the camera center on that point.
   *
   * NB: The camera may decide not to center on that point, depending on zoom
   *     and camera bounds.
   */
  public adjustCamera() {
    if (!this.actorToFollow) return;

    // figure out the entity's position + the offset
    let a = this.actorToFollow;
    let x = a.rigidBody.body.GetWorldCenter().x + this.cameraOffset.x;
    let y = a.rigidBody.body.GetWorldCenter().y + this.cameraOffset.y;

    // request that the camera center on that point
    this.setCenter({ x, y });
  }

  /**
   * Create a CameraService
   *
   * @param ratio The effective (scaled) pixel/meter ratio
   */
  constructor(private ratio: number) {
    // set up the game camera, with (0, 0) in the top left
    let w = stage.screenWidth / ratio;
    let h = stage.screenHeight / ratio;

    this.center.Set(w / 2, h / 2);
    this.screenDims.Set(stage.screenWidth, stage.screenHeight);
    this.scale = this.ratio;
  }

  /** The pixel/meter ratio of the camera */
  public get scale(): number { return this.ratio; }

  /**
   * Set the pixel/meter ratio of the camera.  Bigger numbers mean zooming in,
   * and smaller ones mean zooming out.
   *
   * NB: The base value is computed at load time to maximize screen width.
   *
   * @param ratio The new pixel/meter ratio
   */
  public set scale(ratio: number) {
    this.ratio = ratio;
    // Update our precomputed visible screen dimensions
    this.scaledVisibleRegionDims.Set(this.screenDims.x / ratio, this.screenDims.y / ratio);
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
   */
  public inBounds(x: number, y: number, r: number) {
    let leftOk = x + r >= this.center.x - this.scaledVisibleRegionDims.x / 2;
    let rightOk = x - r <= this.center.x + this.scaledVisibleRegionDims.x / 2;
    let topOk = y + r >= this.center.y - this.scaledVisibleRegionDims.y / 2;
    let bottomOk = y - r <= this.center.y + this.scaledVisibleRegionDims.y / 2;
    return leftOk && rightOk && topOk && bottomOk;
  }

  /** Return the X coordinate of the left of the camera viewport */
  public getLeft() { return this.center.x - this.scaledVisibleRegionDims.x / 2; }

  /** Return the Y coordinate of the top of the camera viewport */
  public getTop() { return this.center.y - this.scaledVisibleRegionDims.y / 2; }

  /** Return the X coordinate of the right of the camera viewport */
  public getRight() { return this.center.x + this.scaledVisibleRegionDims.x / 2; }

  /** Return the Y coordinate of the bottom of the camera viewport */
  public getBottom() { return this.center.y + this.scaledVisibleRegionDims.y / 2; }

  /**
   * Convert screen coordinates (absolute pixels), to world coordinates (meters)
   *
   * @param screen.x The X coordinate, in pixels
   * @param screen.y The Y coordinate, in pixels
   */
  public screenToMeters(screen: { x: number, y: number }) {
    return { x: screen.x / this.ratio + this.getLeft(), y: screen.y / this.ratio + this.getTop() };
  }

  /**
   * Convert world coordinates (meters) to screen coordinates (absolute pixels)
   *
   * @param world.x The X coordinate, in meters
   * @param world.y The Y coordinate, in meters
   */
  public metersToScreen(world: { x: number, y: number }) {
    return { x: (world.x - this.getLeft()) * this.ratio, y: (world.y - this.getTop()) * this.ratio };
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
      let w = this.ratio * (this.maxX - this.minX);
      if (Math.round(w) < Math.round(this.screenDims.x)) stage.console.log("Warning, the visible game area is less than the screen width");
    }

    if (this.maxY != undefined && this.minY != undefined) {
      let h = this.ratio * (this.maxY - this.minY);
      if (Math.round(h) < Math.round(this.screenDims.y)) stage.console.log("Warning, the visible game area is less than the screen height");
    }
  }

  /**
   * Add an actor to the level
   *
   * @param actor The actor to add
   */
  addActor(actor: Actor) { this.actors.push(actor); }

  /** Render the actors associated with this camera */
  render(elapsedMs: number, location: SpriteLocation) {
    // Draw everything
    for (let renderable of this.actors)
      if (renderable.prerender(elapsedMs))
        for (let a of renderable.appearance)
          a.render(this, location);
  }
}
