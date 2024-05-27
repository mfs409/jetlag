import { Application, Container, Graphics, Sprite as PixiSprite, Text as PixiText, Filter, SCALE_MODES } from "pixi.js";
import { stage } from "../Stage";
import { AppearanceComponent, FilledBox, FilledCircle, FilledPolygon, FilledRoundedBox, TextSprite, ZIndex } from "../Components/Appearance";
import { RigidBodyComponent, BoxBody, CircleBody, PolygonBody } from "../Components/RigidBody";
import { CameraService } from "../Services/Camera";
import { Sprite } from "../Services/ImageLibrary";
import { b2Vec2 } from "@box2d/core";
import { FilterComponent } from "../Components/FilterComponent"

/** The location of a sprite */
export enum SpriteLocation { WORLD, HUD, OVERLAY };

/**
 * FilterableContainer holds a container of renderable Pixi objects and a
 * collection of filters that might be applied to the whole container
 */
class FilterableContainer {
  /** A container for holding Pixi Graphics/Sprites/Text/etc */
  readonly container: Container = new Container();
  /** A set of filters that may be applied to the container */
  filters: FilterComponent[] = [];
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
  /** Five container/filter pairs, for the five Z planes */
  private zContainers: [FilterableContainer, FilterableContainer, FilterableContainer, FilterableContainer, FilterableContainer];

  /** One more container/filter pair, that can hold the five Z containers */
  private metaContainer: FilterableContainer;

  /** Construct a FilterableContainerSet by initializing all the containers */
  constructor() {
    this.metaContainer = new FilterableContainer();
    this.zContainers = [new FilterableContainer(), new FilterableContainer(), new FilterableContainer(), new FilterableContainer(), new FilterableContainer()];
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
  public addChild(graphic: Graphics | PixiSprite | PixiText, z: ZIndex) {
    this.zContainers[z + 2].container.addChild(graphic);
  }

  /**
   * Add a filter to one of the z indices.
   *
   * @param filter The filter to add
   * @param z      The z index on which to add the filter
   */
  public addZFilter(filter: FilterComponent, z: ZIndex) {
    this.zContainers[z + 2].filters.push(filter);
  }

  /**
   * Add a filter to the whole container
   *
   * @param filter The filter to add
   */
  public addFilter(filter: FilterComponent) {
    this.metaContainer.filters.push(filter);
  }

  /** Reset all state when the stage transitions to a new builder */
  public reset() {
    for (let c of this.zContainers)
      c.reset();
    this.metaContainer.reset();
  }
}

/**
 * RenderDevice is a wrapper around the PIXI Application object.  It
 * initializes the render loop, which fires at a regular interval to tell the
 * game to advance the simulation by some number of milliseconds.  Doing this
 * many times per second is what makes our game work :)
 *
 * <!--
 * As of December 2023, PIXI.js v 7.3.2's '.d.ts' file isn't always exactly
 * correct.  There are a few `as any` casts in this file for dealing with the
 * issues.  Re-check these casts as PIXI.js updates.
 *  -->
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

  /** The "time" in milliseconds, where 0 is when the game started */
  public get now() { return this.elapsed; }

  /** The most recently-taken screenshot */
  public mostRecentScreenShot?: PixiSprite;

  /** Is someone requesting that a new screenshot be taken? */
  public screenshotRequested = false;

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
  constructor(screenWidth: number, screenHeight: number, domId: string, debugMode: boolean) {
    // Create a rendering context and attach it to the the DOM
    this.pixi = new Application({ width: screenWidth, height: screenHeight, antialias: false });
    document.getElementById(domId)!.appendChild(this.pixi.view as any);

    // Set up the containers we will use when rendering
    this.backgroundContainer = new FilterableContainer();
    this.worldContainers = new FilterableContainerSet();
    this.foregroundContainer = new FilterableContainer();
    this.hudContainers = new FilterableContainerSet();
    this.overlayContainers = new FilterableContainerSet();
    if (debugMode) this.debug = new Container();
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

      // Advance either the overlay or the world
      let x = this.pixi.ticker.elapsedMS;
      this.elapsed += x;
      stage.renderOverlay(x);
      this.overlayContainers.addToStage(this.pixi.stage, x);
      stage.renderWorld(x);
      // NB: We manually add the foreground and background containers to the stage
      this.backgroundContainer.attachFilters(x);
      this.pixi.stage.addChild(this.backgroundContainer.container);
      this.worldContainers.addToStage(this.pixi.stage, x);
      this.foregroundContainer.attachFilters(x);
      this.pixi.stage.addChild(this.foregroundContainer.container);

      // Grab a screenshot (pre HUD) if we don't have one yet
      if (this.screenshotRequested) {
        this.screenshotRequested = false;
        this.mostRecentScreenShot = new PixiSprite(this.pixi.renderer.generateTexture(this.pixi.stage, { scaleMode: SCALE_MODES.LINEAR, resolution: 1, region: this.pixi.renderer.screen }));
      }

      // Advance the HUD and render it
      stage.renderHud(x);
      this.hudContainers.addToStage(this.pixi.stage, x);

      // Render the debug container?
      if (this.debug) this.pixi.stage.addChild(this.debug);
    });
  }

  /**
   * Set the background color of the next frame to a HTML hex value (e.g.,
   * 0xaaffbb)
   */
  public setFrameColor(color: number) {
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
    rect.lineStyle(1, color);
    rect.drawRect(x, y, w, h);
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
   * @param color   The color for the outline of the rectangle
   */
  private drawDebugCircle(x: number, y: number, radius: number, rot: number, circ: Graphics, line: Graphics, color: number) {
    // Draw the circle
    circ.clear();
    circ.lineStyle(1, color);
    circ.drawCircle(x, y, radius);
    this.debug!.addChild(circ);
    // Also draw a radial line, to indicate rotation
    line.clear();
    line.position.set(x, y);
    line.lineStyle(1, color).moveTo(0, 0).lineTo(radius * Math.cos(rot), radius * Math.sin(rot));
    this.debug!.addChild(line);
  }

  /**
   * Draw a polygon.  You can think of this as a "hit box"
   *
   * @param x     The center x coordinate
   * @param y     The center y coordinate
   * @param rot   The rotation, in radians
   * @param s     The scaling factor for pixels-to-meters
   * @param poly  The vertices of the polygon
   * @param rect  The PIXI graphics object to (re) use to make the polygon
   */
  private drawDebugPoly(x: number, y: number, rot: number, s: number, verts: b2Vec2[], poly: Graphics) {
    // For polygons, we need to translate the points (they are 0-relative in
    // Box2d, we need them to be relative to (x,y))
    poly.clear();
    poly.lineStyle(1, 0xff00ff);
    let pts: number[] = [];
    for (let pt of verts) {
      pts.push(s * pt.x + x);
      pts.push(s * pt.y + y);
    }
    // NB: must repeat start point of polygon in PIXI
    pts.push(s * verts[0].x + x);
    pts.push(s * verts[0].y + y);
    poly.drawPolygon(pts);
    // rotation
    poly.position.set(x, y);
    poly.pivot.set(x, y);
    poly.rotation = rot;
    this.debug!.addChild(poly);
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
    //
    // WARNING: This does not take into account offsets, or that the hit box can
    //          be smaller than the appearance
    if (!camera.inBounds(body.getCenter().x, body.getCenter().y, body.radius)) return;
    // Common fields and common appearance configuration:
    let s = camera.getScale();
    let x = s * (body.getCenter().x + appearance.offset.dx - camera.getLeft());
    let y = s * (body.getCenter().y + appearance.offset.dy - camera.getTop());
    if (appearance.lineWidth && appearance.lineColor)
      graphic.lineStyle(appearance.lineWidth, appearance.lineColor);
    if (appearance.fillColor)
      graphic.beginFill(appearance.fillColor);
    if (appearance instanceof FilledBox) {
      let w = s * appearance.width;
      let h = s * appearance.height;
      graphic.drawRect(x, y, w, h);
      graphic.position.set(x, y);
      graphic.pivot.set(x + w / 2, y + h / 2);
      graphic.rotation = body.getRotation();
    }
    else if (appearance instanceof FilledRoundedBox) {
      let w = s * appearance.width;
      let h = s * appearance.height;
      let r = s * appearance.radius;
      graphic.drawRoundedRect(x, y, w, h, r);
      graphic.position.set(x, y);
      graphic.pivot.set(x + w / 2, y + h / 2);
      graphic.rotation = body.getRotation();
    }
    else if (appearance instanceof FilledCircle) {
      let radius = s * appearance.radius;
      graphic.drawCircle(x, y, radius);
    }
    else if (appearance instanceof FilledPolygon) {
      // For polygons, we need to translate the points (they are 0-relative in
      // Box2d, we need them to be relative to (x,y))
      let pts: number[] = [];
      for (let pt of appearance.vertices) {
        pts.push(s * pt.x + x);
        pts.push(s * pt.y + y);
      }
      // NB: must repeat start point of polygon in PIXI
      pts.push(pts[0]);
      pts.push(pts[1]);
      graphic.drawPolygon(pts);
      graphic.position.set(x, y);
      graphic.pivot.set(x, y);
      graphic.rotation = body.getRotation();
    }
    else {
      throw "Error: unrecognized FilledSprite?"
    }
    switch (location) {
      case SpriteLocation.WORLD: this.worldContainers.addChild(graphic, z); break;
      case SpriteLocation.OVERLAY: this.overlayContainers.addChild(graphic, z); break;
      case SpriteLocation.HUD: this.hudContainers.addChild(graphic, z); break;
    }

    // Debug render?
    if (this.debug != undefined)
      this.debugDraw(body, camera);
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
    //
    // WARNING: This does not take into account offsets, or that the hit box can
    //          be smaller than the appearance
    if (!camera.inBounds(body.getCenter().x, body.getCenter().y, body.radius)) return;

    // Compute the dimensions of the actor, in pixels
    let s = camera.getScale();
    let x = s * (body.getCenter().x + appearance.offset.dx - camera.getLeft());
    let y = s * (body.getCenter().y + appearance.offset.dy - camera.getTop());

    // Add the sprite
    sprite.setAnchoredPosition(0.5, 0.5, x, y); // (.5, .5) == anchor at center
    sprite.sprite.width = s * appearance.width;
    sprite.sprite.height = s * appearance.height;
    sprite.sprite.rotation = body.getRotation();
    switch (location) {
      case SpriteLocation.WORLD: this.worldContainers.addChild(sprite.sprite, z); break;
      case SpriteLocation.OVERLAY: this.overlayContainers.addChild(sprite.sprite, z); break;
      case SpriteLocation.HUD: this.hudContainers.addChild(sprite.sprite, z); break;
    }

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
    let s = camera.getScale();
    let r = body.getRotation();
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
   * Add a Picture to the next frame.  Note that pictures are never rotated or
   * offset, because we only use this for Parallax pictures (which have no rigid
   * body, and hence no rotation).
   *
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
    let s = camera.getScale();
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
      this.drawDebugBox(x, y, w, h, appearance.actor?.rigidBody.getRotation() ?? 0, sprite.debug, 0xff0000);
  }

  /**
   * Add text to the next frame
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
    //
    // WARNING: This does not take into account offsets, or that the hit box can
    //          be smaller than the appearance
    if (!camera.inBounds(body.getCenter().x, body.getCenter().y, body.radius)) return;

    // Compute screen coords of center
    let s = camera.getScale();
    let x = s * (body.getCenter().x + text.offset.dx - camera.getLeft());
    let y = s * (body.getCenter().y + text.offset.dy - camera.getTop());

    // NB:  Changing the text's anchor handles top-left vs center
    text.text.text.anchor.set(.5, .5);
    if (!center)
      text.text.text.anchor.set(0, 0);

    text.text.text.position.x = x;
    text.text.text.position.y = y;
    text.text.text.rotation = body.getRotation();
    switch (location) {
      case SpriteLocation.WORLD: this.worldContainers.addChild(text.text.text, z); break;
      case SpriteLocation.OVERLAY: this.overlayContainers.addChild(text.text.text, z); break;
      case SpriteLocation.HUD: this.hudContainers.addChild(text.text.text, z); break;
    }

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
  public addZFilter(filter: FilterComponent, z: ZIndex, location: SpriteLocation) {
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
   * @param location Where to put the filter (WORLD, OVERLAY, or HUD)
   */
  public addFilter(filter: FilterComponent, location: SpriteLocation) {
    switch (location) {
      case SpriteLocation.HUD: this.hudContainers.addFilter(filter); break;
      case SpriteLocation.OVERLAY: this.overlayContainers.addFilter(filter); break;
      case SpriteLocation.WORLD: this.worldContainers.addFilter(filter); break;
    }
  }
}