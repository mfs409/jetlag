import { Application, Container, Graphics, ParticleContainer, Sprite as PixiSprite, Text as PixiText, Filter, ColorSource, } from "pixi.js";
import { stage } from "../Stage";
import { AppearanceComponent, FilledBox, FilledCircle, FilledPolygon, FilledRoundedBox, MAX_Z_INDEX, MIN_Z_INDEX, ParticleComponent, TextSprite, ZIndex, } from "../Components/Appearance";
import { RigidBodyComponent, BoxBody, CircleBody, PolygonBody } from "../Components/RigidBody";
import { CameraService } from "../Services/Camera";
import { Sprite } from "../Services/ImageLibrary";
import { b2Vec2 } from "@box2d/core";
import { FilterComponent } from "../Components/FilterComponent"

/** The location of a sprite */
export enum SpriteLocation { WORLD, HUD, OVERLAY, BACKGROUND, FOREGROUND };

/**
 * FilterableContainer holds a container of renderable Pixi objects and a
 * collection of filters that might be applied to the whole container
 */
class FilterableContainer {
  /** A container for holding Pixi Graphics/Sprites/Text/etc */
  readonly container: Container = new Container();

  /** A set of filters that may be applied to the container */
  private filters: FilterComponent[] = [];

  /**
   * Add a filter to this container
   *
   * @param filter The filter to add
   */
  public addFilter(filter: FilterComponent) { this.filters.push(filter); }

  /** Clear all the containers at the beginning of a render step */
  public clearForRendering() {
    this.container.removeChildren();
    this.container.filters = [];
  }

  /**
   * Attach any filters that prerender
   *
   * @param elapsedMs The time since the last call to attachFilters
   */
  public attachFilters(elapsedMs: number) {
    let filters = [] as Filter[];
    // [mfs] Rewrite in a functional style
    for (let f of this.filters)
      if (f.preRender(elapsedMs))
        for (let fl of f.getFilters())
          filters.push(fl);
    this.container.filters = filters;
  }

  /** Reset all state */
  public reset() {
    this.clearForRendering();
    this.filters = [];
  }
}

/**
 * FilterableContainerSet has a set of containers for organizing renderables by
 * their Z plane, along with an additional super-container and filters.
 */
class FilterableContainerSet {
  /** One container/filter pair per Z plane (see `MIN_Z_INDEX`/`MAX_Z_INDEX`) */
  private zContainers: FilterableContainer[];

  /** One more container/filter pair, that can hold all of the Z containers */
  private metaContainer: FilterableContainer;

  /** Construct a FilterableContainerSet by initializing all the containers */
  constructor() {
    this.metaContainer = new FilterableContainer();
    this.zContainers = Array.from({ length: MAX_Z_INDEX - MIN_Z_INDEX + 1 }, () => new FilterableContainer());
  }

  /** Clear all the containers at the beginning of a render step */
  public clearForRendering() {
    for (let c of this.zContainers) c.clearForRendering()
    this.metaContainer.clearForRendering();
  }

  /**
   * Add this container set to the renderer, respecting the Z ordering
   *
   * @param pixiStage The renderer's main container
   * @param elapsedMs The time since the last render
   */
  public addToStage(pixiStage: Container, elapsedMs: number) {
    for (let c of this.zContainers) {
      // Attach any z-scoped filters, then add the container
      c.attachFilters(elapsedMs);
      this.metaContainer.container.addChild(c.container);
    }
    // Attach any top-level filters, then add the container
    this.metaContainer.attachFilters(elapsedMs);
    pixiStage.addChild(this.metaContainer.container);
  }

  /**
   * Add a graphic to this FilterableContainerSet, at the appropriate Z index
   *
   * @param asset The Pixi Graphic/Sprite to add to the container
   * @param z     The Z index of the graphic to add
   */
  public addChild(graphic: Graphics | PixiSprite | PixiText | ParticleContainer, z: ZIndex) {
    this.zContainers[z - MIN_Z_INDEX].container.addChild(graphic);
  }

  /**
   * Add a filter to one of the z indices.
   *
   * @param filter The filter to add
   * @param z      The z index on which to add the filter
   */
  public addZFilter(filter: FilterComponent, z: ZIndex) {
    this.zContainers[z - MIN_Z_INDEX].addFilter(filter);
  }

  /**
   * Add a filter to the whole container
   *
   * @param filter The filter to add
   */
  public addFilter(filter: FilterComponent) {
    this.metaContainer.addFilter(filter);
  }

  /** Reset all state when the stage transitions to a new builder */
  public reset() {
    this.zContainers.forEach(c => c.reset());
    this.metaContainer.reset();
  }
}

/**
 * RenderDevice is a wrapper around the PIXI Application object.  It initializes
 * the render loop, which fires at a regular interval to tell the game to
 * advance the simulation by some number of milliseconds.  Doing this many times
 * per second is what makes our game work :)
 *
 * TODO: Pixi prefers when sprites are not removed and re-added to containers on
 *       each tick.  It also has features like "interaction" that can be
 *       disabled.  There's a fair bit of optimization opportunity.
 */
export class RendererDevice {
  /** The pixi application object is responsible for drawing onto a canvas */
  public pixi: Application;

  /**
   * All of the world sprites that will be rendered as part of the currently
   * in-progress render
   */
  private worldContainers: FilterableContainerSet;

  /** A container for all of the foreground parallax images */
  private foregroundContainer: FilterableContainer;

  /** A container for all of the background parallax images */
  private backgroundContainer: FilterableContainer;

  /**
   * All of the HUD sprites that will be rendered as part of the currently
   * in-progress render
   */
  private hudContainers: FilterableContainerSet;

  /**
   * All of the overlay sprites that will be rendered as part of the currently
   * in-progress render
   */
  private overlayContainers: FilterableContainerSet;

  /**
   * debugContainer holds outlines for sprites that will be rendered during
   * the currently in-progress render, but only if we are in debug mode.
   */
  private debug?: Container;

  /** The "time" in milliseconds, where 0 is when the game started */
  private elapsed = 0;

  /**
   * The "time" in milliseconds, where 0 is when the game started.  Unlike
   * `Scene.timer`/`TimedEvent` (which only advance while their own scene is
   * actually being stepped), this keeps ticking every render frame no matter
   * what's currently showing.
   */
  public get now() { return this.elapsed; }

  /** The most recently-taken screenshot */
  public get mostRecentScreenShot() { return this._mostRecentScreenShot; }

  /** The most recently-taken screenshot */
  public set mostRecentScreenShot(s: PixiSprite | undefined) {
    this._mostRecentScreenShot?.destroy(true);
    this._mostRecentScreenShot = s;
  }

  /** The most recently-taken screenshot */
  private _mostRecentScreenShot?: PixiSprite;

  /** Is someone requesting that a new screenshot be taken? */
  public screenshotRequested = false;

  /** FilterComponents to attach to the whole renderer */
  private filters: FilterComponent[] = [];

  /**
   * Reset the renderer's container state when the stage transitions to a new
   * builder
   */
  public reset() {
    this.worldContainers.reset();
    this.foregroundContainer.reset();
    this.backgroundContainer.reset();
    this.hudContainers.reset();
    this.overlayContainers.reset();
    this.filters = [];
  }

  /** Reset the renderer's overlay container state */
  public resetOverlay() { this.overlayContainers.reset(); }

  /**
   * Initialize the renderer.
   *
   * @param screenWidth   The width of the screen
   * @param screenHeight  The height of the screen
   * @param domId         The ID of the DOM element into which we will render
   * @param debugMode     True if debug outlines should be drawn
   */
  constructor(private screenWidth: number, private screenHeight: number, private domId: string, debugMode: boolean) {
    // Create the Application object.  Pixi v8 requires an async `init()` call
    // before the renderer is usable, so the real setup happens in
    // `initialize()`, which must be awaited before this device is used.
    this.pixi = new Application();

    // Set up the containers we will use when rendering
    this.backgroundContainer = new FilterableContainer();
    this.worldContainers = new FilterableContainerSet();
    this.foregroundContainer = new FilterableContainer();
    this.hudContainers = new FilterableContainerSet();
    this.overlayContainers = new FilterableContainerSet();
    if (debugMode) this.debug = new Container();
  }

  /**
   * Finish initializing the Pixi Application and attach it to the DOM.  This
   * must be awaited before the renderer is used.
   */
  public async initialize() {
    await this.pixi.init({ width: this.screenWidth, height: this.screenHeight, antialias: false });
    document.getElementById(this.domId)!.appendChild(this.pixi.canvas);
  }

  /**
   * Start the render loop, which will cause the game simulation to start
   * running.
   */
  public startRenderLoop() {
    this.pixi.ticker.add(() => {
      // Remove all state from the renderer
      this.pixi.stage.removeChildren();
      this.worldContainers.clearForRendering();
      this.foregroundContainer.clearForRendering();
      this.backgroundContainer.clearForRendering();
      this.hudContainers.clearForRendering();
      this.overlayContainers.clearForRendering();
      this.debug?.removeChildren();
      this.pixi.stage.filters = [];

      // Advance either the overlay or the world
      let x = this.pixi.ticker.elapsedMS;
      this.elapsed += x;
      // Gamepads are polled unconditionally, every tick, regardless of
      // whether the overlay, world, or HUD is what's currently active --
      // see `Stage.pollGamepads` for why.
      stage.pollGamepads();
      stage.renderOverlay(x);
      this.overlayContainers.addToStage(this.pixi.stage, x);
      stage.renderWorld(x);
      // NB: We manually add the foreground and background containers to the
      // stage
      this.backgroundContainer.attachFilters(x);
      this.pixi.stage.addChild(this.backgroundContainer.container);
      this.worldContainers.addToStage(this.pixi.stage, x);
      this.foregroundContainer.attachFilters(x);
      this.pixi.stage.addChild(this.foregroundContainer.container);

      // Grab a screenshot (pre HUD) if we don't have one yet
      if (this.screenshotRequested) {
        this.screenshotRequested = false;
        this.mostRecentScreenShot = new PixiSprite(this.pixi.renderer.generateTexture({ target: this.pixi.stage, resolution: 1, frame: this.pixi.renderer.screen, textureSourceOptions: { scaleMode: 'linear' } }));
      }

      // Advance the HUD and render it
      stage.renderHud(x);
      this.hudContainers.addToStage(this.pixi.stage, x);

      // Render the debug container?
      if (this.debug) this.pixi.stage.addChild(this.debug);

      // Top-level filters?
      let topLevelFilters: Filter[] = [];
      for (let c of this.filters) {
        if (c.preRender(x))
          for (let f of c.getFilters())
            topLevelFilters.push(f);
      }
      this.pixi.stage.filters = topLevelFilters;
    });
  }

  /**
   * Set the background color of the next frame.  Accepts any PIXI
   * `ColorSource`, but we only use CSS hex strings.
   *
   * @param color The new background color, as a CSS hex string (e.g. "#ff0000")
   */
  public setFrameColor(color: ColorSource) {
    this.pixi.renderer.background.color = color;
  }

  /**
   * Draw a rectangle.  You can think of this as a "hit box"
   *
   * @param x     The center x coordinate
   * @param y     The center y coordinate
   * @param w     The width, in pixels
   * @param h     The height, in pixels
   * @param rot   The rotation, in radians
   * @param rect  The PIXI graphics object to (re) use to make the rectangle
   * @param color The color for the outline of the rectangle
   */
  private drawDebugBox(x: number, y: number, w: number, h: number, rot: number, rect: Graphics, color: number) {
    rect.clear();
    rect.rect(x, y, w, h).stroke({ width: 1, color });
    rect.position.set(x, y);
    rect.pivot.set(x + w / 2, y + h / 2);
    rect.rotation = rot;
    this.debug!.addChild(rect);
  }

  /**
   * Draw a circle.  You can think of this as a "hit box"
   *
   * @param x       The center x coordinate
   * @param y       The center y coordinate
   * @param radius  The radius, in pixels
   * @param rot     The rotation, in radians
   * @param circ    The PIXI graphics object to (re) use to make the circle
   * @param line    The PIXI graphics object to (re) use to draw the radius
   * @param color   The color for the outline of the circle
   */
  private drawDebugCircle(x: number, y: number, radius: number, rot: number, circ: Graphics, line: Graphics, color: number) {
    // Draw the circle
    circ.clear();
    circ.circle(x, y, radius).stroke({ width: 1, color });
    this.debug!.addChild(circ);
    // Also draw a radial line, to indicate rotation
    line.clear();
    line.position.set(x, y);
    line.moveTo(0, 0).lineTo(radius * Math.cos(rot), radius * Math.sin(rot)).stroke({ width: 1, color });
    this.debug!.addChild(line);
  }

  /**
   * Convert a polygon's vertices (0-relative, as Box2D stores them) into a
   * flat array of PIXI-ready absolute points, scaled and translated to
   * (x,y), with the start point repeated at the end (PIXI requires this to
   * close the loop).  Shared by `drawDebugPoly` and `addFilledSpriteToFrame`'s
   * FilledPolygon case.
   *
   * @param x     The center x coordinate
   * @param y     The center y coordinate
   * @param s     The scaling factor for pixels-to-meters
   * @param verts The vertices of the polygon
   */
  private polygonPoints(x: number, y: number, s: number, verts: { x: number, y: number }[]) {
    let pts: number[] = [];
    for (let pt of verts) {
      pts.push(s * pt.x + x);
      pts.push(s * pt.y + y);
    }
    // NB: must repeat start point of polygon in PIXI
    pts.push(pts[0]);
    pts.push(pts[1]);
    return pts;
  }

  /**
   * Draw a polygon.  You can think of this as a "hit box"
   *
   * @param x     The center x coordinate
   * @param y     The center y coordinate
   * @param rot   The rotation, in radians
   * @param s     The scaling factor for pixels-to-meters
   * @param verts The vertices of the polygon
   * @param poly  The PIXI graphics object to (re) use to make the polygon
   */
  private drawDebugPoly(x: number, y: number, rot: number, s: number, verts: b2Vec2[], poly: Graphics) {
    // For polygons, we need to translate the points (they are 0-relative in
    // Box2d, we need them to be relative to (x,y))
    poly.clear();
    let pts = this.polygonPoints(x, y, s, verts);
    poly.poly(pts).stroke({ width: 1, color: 0xff00ff });
    // rotation
    poly.position.set(x, y);
    poly.pivot.set(x, y);
    poly.rotation = rot;
    this.debug!.addChild(poly);
  }

  /**
   * Add a child (of whichever Pixi type) to the appropriate container for
   * `location`, at Z index `z`.  Shared by every `add*ToFrame` method that
   * can render to WORLD, OVERLAY, or HUD.
   *
   * @param child     The Pixi object to add
   * @param z         The Z index at which to add it
   * @param location  Where is this being drawn (WORLD, OVERLAY, or HUD)?
   */
  private addToLocation(child: Graphics | PixiSprite | PixiText | ParticleContainer, z: ZIndex, location: SpriteLocation) {
    switch (location) {
      case SpriteLocation.WORLD: this.worldContainers.addChild(child, z); break;
      case SpriteLocation.OVERLAY: this.overlayContainers.addChild(child, z); break;
      case SpriteLocation.HUD: this.hudContainers.addChild(child, z); break;
    }
  }

  /**
   * Compute the on-screen (pixel) scale and position of a body-anchored
   * appearance, or `undefined` if the body is off-screen.  Shared by every
   * `add*ToFrame` method that draws something anchored to a `RigidBodyComponent`.
   *
   * WARNING: The bounds check does not take into account offsets, or that
   *          the hit box can be smaller than the appearance.
   *
   * @param body    The rigid body the appearance is anchored to
   * @param offset  The appearance's offset from the body's center
   * @param camera  The camera (and by extension, the world)
   */
  private screenPos(body: RigidBodyComponent, offset: { dx: number, dy: number }, camera: CameraService) {
    if (!camera.inBounds(body.getCenter().x, body.getCenter().y, body.radius)) return undefined;
    let s = camera.scale;
    let x = s * (body.getCenter().x + offset.dx - camera.getLeft());
    let y = s * (body.getCenter().y + offset.dy - camera.getTop());
    return { s, x, y };
  }

  /**
   * Add a filled sprite (a Pixi Graphic) to the main container
   *
   * @param appearance  The filled sprite to draw
   * @param body        The rigid body that accompanies the filled sprite
   * @param graphic     The graphic context
   * @param camera      The camera (and by extension, the world)
   * @param z           The Z index of the sprite
   * @param location    Where is this being drawn (WORLD, OVERLAY, or HUD)?
   */
  public addFilledSpriteToFrame(appearance: FilledBox | FilledCircle | FilledPolygon | FilledRoundedBox, body: RigidBodyComponent, graphic: Graphics, camera: CameraService, z: ZIndex, location: SpriteLocation) {
    graphic.clear();
    // If the actor isn't on screen, skip it
    let pos = this.screenPos(body, appearance.offset, camera);
    if (!pos) return;
    let { s, x, y } = pos;
    if (appearance instanceof FilledBox) {
      let w = s * appearance.width;
      let h = s * appearance.height;
      graphic.rect(x, y, w, h);
      if (appearance.fillColor)
        graphic.fill(appearance.fillColor);
      if (appearance.lineWidth && appearance.lineColor)
        graphic.stroke({ width: appearance.lineWidth * stage.pixelMeterRatio, color: appearance.lineColor });
      graphic.position.set(x, y);
      graphic.pivot.set(x + w / 2, y + h / 2);
      graphic.rotation = body.rotation;
    }
    else if (appearance instanceof FilledRoundedBox) {
      let w = s * appearance.width;
      let h = s * appearance.height;
      let r = s * appearance.radius;
      graphic.roundRect(x, y, w, h, r);
      if (appearance.fillColor)
        graphic.fill(appearance.fillColor);
      if (appearance.lineWidth && appearance.lineColor)
        graphic.stroke({ width: appearance.lineWidth * stage.pixelMeterRatio, color: appearance.lineColor });
      graphic.position.set(x, y);
      graphic.pivot.set(x + w / 2, y + h / 2);
      graphic.rotation = body.rotation;
    }
    else if (appearance instanceof FilledCircle) {
      let radius = s * appearance.radius;
      graphic.circle(x, y, radius);
      if (appearance.fillColor)
        graphic.fill(appearance.fillColor);
      if (appearance.lineWidth && appearance.lineColor)
        graphic.stroke({ width: appearance.lineWidth * stage.pixelMeterRatio, color: appearance.lineColor });
    }
    else if (appearance instanceof FilledPolygon) {
      // For polygons, we need to translate the points (they are 0-relative in
      // Box2d, we need them to be relative to (x,y))
      let pts = this.polygonPoints(x, y, s, appearance.vertices);
      graphic.poly(pts);
      if (appearance.fillColor)
        graphic.fill(appearance.fillColor);
      if (appearance.lineWidth && appearance.lineColor)
        graphic.stroke({ width: appearance.lineWidth * stage.pixelMeterRatio, color: appearance.lineColor });
      graphic.position.set(x, y);
      graphic.pivot.set(x, y);
      graphic.rotation = body.rotation;
    }
    else {
      throw "Error: unrecognized FilledSprite?"
    }
    this.addToLocation(graphic, z, location);

    // Debug render?
    if (this.debug != undefined)
      this.debugDraw(body, camera);
  }

  /**
   * Position and rotate a ParticleComponent's whole ParticleContainer to
   * match its Actor's RigidBody, and add it to the next frame.
   *
   * Unlike `addFilledSpriteToFrame`/`addBodyToFrame`, this doesn't transform
   * each visual element individually -- it transforms the *container* once,
   * and every particle inside it (positioned in meters, relative to the
   * container's own origin) inherits that position/rotation/scale for free,
   * because that's how a Pixi scene graph works.
   *
   * @param appearance  The ParticleComponent to draw
   * @param body        The rigid body that determines where (and which way)
   *                    the particle system is anchored
   * @param camera      The camera (and by extension, the world)
   * @param z           The Z index of the particle system
   * @param location    Where is this being drawn (WORLD, OVERLAY, or HUD)?
   */
  public addParticlesToFrame(appearance: ParticleComponent, body: RigidBodyComponent, camera: CameraService, z: ZIndex, location: SpriteLocation) {
    // If the anchor isn't on screen, skip it.
    //
    // WARNING: like addFilledSpriteToFrame, this does not account for the
    // possibility that particles have traveled beyond the anchor's own
    // radius while the anchor itself is off-screen.
    let pos = this.screenPos(body, appearance.offset, camera);
    if (!pos) return;
    let { s, x, y } = pos;
    appearance.container.position.set(x, y);
    // Individual particles live in meters, relative to this origin; scaling
    // the container by the camera's meters-to-pixels ratio converts all of
    // them at once
    appearance.container.scale.set(s);
    appearance.container.rotation = body.rotation;

    this.addToLocation(appearance.container, z, location);
  }

  /**
   * Add an actor (physics+image) to the next frame
   *
   * @param appearance  The AppearanceComponent for the actor
   * @param body        The rigidBody of the actor
   * @param sprite      The sprite, from `appearance`
   * @param camera      The camera that determines which actors to show, and
   *                    where
   * @param z           The Z index of the sprite
   * @param location    Where is this being drawn (WORLD, OVERLAY, or HUD)?
   */
  public addBodyToFrame(appearance: AppearanceComponent, body: RigidBodyComponent, sprite: Sprite, camera: CameraService, z: ZIndex, location: SpriteLocation) {
    // If the actor isn't on screen, skip it
    let pos = this.screenPos(body, appearance.offset, camera);
    if (!pos) return;
    let { s, x, y } = pos;

    // Add the sprite
    sprite.setAnchoredPosition(0.5, 0.5, x, y); // (.5, .5) == anchor at center
    sprite.sprite.width = s * appearance.width;
    sprite.sprite.height = s * appearance.height;
    sprite.sprite.rotation = body.rotation;
    this.addToLocation(sprite.sprite, z, location);

    // Debug render?
    if (this.debug != undefined)
      this.debugDraw(body, camera);
  }

  /**
   * Draw an outline for a rigid body
   * 
   * @param body    The rigid body whose outline we'll draw
   * @param camera  The camera related to where we're drawing
   */
  private debugDraw(body: RigidBodyComponent, camera: CameraService) {
    let s = camera.scale;
    let r = body.rotation;
    let x = s * (body.getCenter().x - camera.getLeft());
    let y = s * (body.getCenter().y - camera.getTop());
    let w = s * body.w;
    let h = s * body.h;
    if (!this.debug || !body.debug) return;
    if (body instanceof BoxBody)
      this.drawDebugBox(x, y, w, h, r, body.debug.shape, 0x00ff00);
    else if (body instanceof CircleBody)
      this.drawDebugCircle(x, y, body.radius * s, r, body.debug.shape, body.debug.line, 0x0000ff);
    else if (body instanceof PolygonBody)
      this.drawDebugPoly(x, y, r, s, body.vertArray, body.debug.shape);
  }

  /**
   * Add a Parallax Image to the next frame.  Note that pictures are never
   * rotated or offset, because we only use this for Parallax images (which have
   * no rigid body, and hence no rotation).
   *
   * @param anchor      The center x/y at which to draw the image
   * @param appearance  The AppearanceComponent for the actor
   * @param sprite      The sprite, from `appearance`
   * @param camera      The camera that determines which actors to show, and
   *                    where
   * @param foreground  Should this go in the foreground (true) or background
   *                    (false)?
   */
  public addParallaxToFrame(anchor: { cx: number, cy: number }, appearance: AppearanceComponent, sprite: Sprite, camera: CameraService, foreground: boolean) {
    // If the picture isn't on screen, skip it
    let radius = Math.sqrt(Math.pow(appearance.width / 2, 2) + Math.pow(appearance.height / 2, 2))
    if (!camera.inBounds(anchor.cx, anchor.cy, radius)) return;

    // Convert from meters to pixels
    let s = camera.scale;
    let x = s * (anchor.cx - camera.getLeft());
    let y = s * (anchor.cy - camera.getTop());
    let w = s * appearance.width;
    let h = s * appearance.height;

    // Put it on screen
    sprite.setAnchoredPosition(0.5, 0.5, x, y); // (.5, .5) == anchor at center
    sprite.sprite.width = w;
    sprite.sprite.height = h;
    sprite.sprite.rotation = 0;
    if (foreground)
      this.foregroundContainer.container.addChild(sprite.sprite);
    else
      this.backgroundContainer.container.addChild(sprite.sprite);

    // Debug rendering: draw a box around the image
    if (this.debug)
      this.drawDebugBox(x, y, w, h, appearance.actor?.rigidBody.rotation ?? 0, sprite.debug, 0xff0000);
  }

  /**
   * Add text to the frame
   *
   * @param text     The text object to display
   * @param body     The rigidBody of the actor
   * @param camera   The camera that determines which text to show, and where
   * @param center   Should we center the text at its x/y coordinate?
   * @param z        The Z index of the sprite
   * @param location Where is this being drawn (WORLD, OVERLAY, or HUD)?
   */
  public addTextToFrame(text: TextSprite, body: RigidBodyComponent, camera: CameraService, center: boolean, z: ZIndex, location: SpriteLocation) {
    // If the actor isn't on screen, skip it
    let pos = this.screenPos(body, text.offset, camera);
    if (!pos) return;
    let { x, y } = pos;

    // NB:  Changing the text's anchor handles top-left vs center
    text.text.text.anchor.set(.5, .5);
    if (!center)
      text.text.text.anchor.set(0, 0);

    text.text.text.position.x = x;
    text.text.text.position.y = y;
    text.text.text.rotation = body.rotation;
    this.addToLocation(text.text.text, z, location);

    // Draw a debug box around the text?
    if (this.debug != undefined) {
      // bounds tells us the bounding box in world coords.  For rotated text,
      // it'll be too big, so we use local bounds to get the bounding box dims.
      let bounds = text.text.text.getBounds();
      let lBounds = text.text.text.getLocalBounds();
      this.drawDebugBox(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, lBounds.width, lBounds.height, text.text.text.rotation, text.text.debug, 0xFF00FF);
    }

    // Debug render?
    if (this.debug != undefined)
      this.debugDraw(body, camera);
  }

  /**
   * Return the current Frames-Per-Second of the renderer.  This can be useful
   * when debugging
   */
  public getFPS() { return this.pixi.ticker.FPS; }

  /**
   * Add a filter to one of the z indices.
   *
   * @param filter   The filter to add
   * @param z        The z index on which to add the filter
   * @param location Where to put the filter (WORLD, OVERLAY, or HUD)
   */
  public addZFilter(filter: FilterComponent, z: ZIndex, location: SpriteLocation.HUD | SpriteLocation.OVERLAY | SpriteLocation.WORLD) {
    switch (location) {
      case SpriteLocation.HUD: this.hudContainers.addZFilter(filter, z); break;
      case SpriteLocation.OVERLAY: this.overlayContainers.addZFilter(filter, z); break;
      case SpriteLocation.WORLD: this.worldContainers.addZFilter(filter, z); break;
    }
  }

  /**
   * Add a filter to the whole container
   *
   * @param filter   The filter to add
   * @param location Where to put the filter (WORLD, OVERLAY, HUD, BACKGROUND,
   *                 or FOREGROUND)
   */
  public addFilter(filter: FilterComponent, location: SpriteLocation) {
    switch (location) {
      case SpriteLocation.HUD: this.hudContainers.addFilter(filter); break;
      case SpriteLocation.OVERLAY: this.overlayContainers.addFilter(filter); break;
      case SpriteLocation.WORLD: this.worldContainers.addFilter(filter); break;
      case SpriteLocation.BACKGROUND: this.backgroundContainer.addFilter(filter); break;
      case SpriteLocation.FOREGROUND: this.foregroundContainer.addFilter(filter); break;
    }
  }

  /**
   * Add a filter to the entire rendered frame, instead of to one specific
   * `SpriteLocation` container.  This applies to the whole PIXI stage
   * (world, hud, overlay, background, and foreground, all composited
   * together), unlike `addFilter`/`addZFilter`, which scope to one
   * container or Z index.
   *
   * @param filter The filter to add
   */
  public addFilterToMain(filter: FilterComponent) {
    this.filters.push(filter);
  }
}