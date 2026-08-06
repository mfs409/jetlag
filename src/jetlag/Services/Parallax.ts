import { b2Vec2 } from "@box2d/core";
import { stage } from "../Stage";
import { CameraService } from "./Camera";
import { AnimatedSprite, ImageSprite } from "../Components/Appearance";

/**
 * A ParallaxLayer is a layer that seems to scroll and repeat.  Layering
 * several, with different scroll speeds, gives a sense of depth to the
 * background.
 */
class ParallaxLayer {
  /** The images to display */
  private images: (ImageSprite | AnimatedSprite)[] = [];

  /** coordinates of last render */
  private last = new b2Vec2(0, 0);

  /** Last camera position */
  private lastCam = new b2Vec2(0, 0);

  /** Speed at which it scrolls.  Important values are 0, 1, and between.  Differs for auto and non-auto. */
  private readonly speed: number;

  /** True for X scrolling, false for Y scrolling */
  private readonly isHorizontal: boolean;

  /** True if this should scroll regardless of the camera */
  private readonly isAuto: boolean;

  /**
   * Construct a ParallaxLayer that can be rendered correctly
   *
   * @param cfg.anchor        A reference point for where one tile of the
   *                          defaultImage will be placed.
   * @param cfg.speed         Speed at which it scrolls.  Important values are
   *                          0, 1, and between.  Differs for auto and non-auto.
   * @param cfg.isHorizontal  True for X scrolling, false for Y scrolling
   * @param cfg.isAuto        True if this should scroll regardless of the camera
   * @param imageMaker        An ImageSprite or AnimatedSprite that will be
   *                          cloned in order to produce enough images to
   *                          achieve a good scrolling effect.
   */
  constructor(cfg: { anchor: { cx: number, cy: number }, speed: number, isHorizontal: boolean, isAuto: boolean }, imageMaker: () => (ImageSprite | AnimatedSprite)) {
    this.speed = cfg.speed;
    this.isHorizontal = cfg.isHorizontal;
    this.isAuto = cfg.isAuto;
    let firstImage = imageMaker();
    this.images.push(firstImage);
    this.last.Set(cfg.anchor.cx - firstImage.width / 2, cfg.anchor.cy - firstImage.height / 2);
    // figure out how many sprites we need to properly tile the image
    let num = 1;
    if (this.isHorizontal) {
      let screenWidthMeters = stage.screenWidth / stage.pixelMeterRatio;
      num += Math.ceil(screenWidthMeters / firstImage.width);
    } else {
      let screenHeightMeters = stage.screenHeight / stage.pixelMeterRatio;
      num += Math.ceil(screenHeightMeters / firstImage.height);
    }
    for (let i = 1; i < num; ++i)
      this.images.push(imageMaker());
  }

  /**
   * Render a layer
   *
   * @param camera     The camera for the world that these layers accompany
   * @param elapsedMs  The time since the last render
   * @param foreground Does this go in the foreground (true) or background
   *                   (false)?
   */
  public render(camera: CameraService, elapsedMs: number, foreground: boolean) {
    this.images.forEach(i => i.prerender(elapsedMs));
    if (this.isAuto) {
      this.renderAuto(camera, elapsedMs, foreground);
    } else {
      this.renderRelative(camera, foreground);
    }
  }

  /**
   * Draw a layer that moves in a fixed velocity in the X dimension
   *
   * @param camera     The camera for the world that these layers accompany
   * @param elapsedMs  The elapsed time since we last drew this layer
   * @param foreground Does this go in the foreground (true) or background
   *                   (false)?
   */
  private renderAuto(camera: CameraService, elapsedMs: number, foreground: boolean) {
    // Determine the position of a reference tile of the image
    if (this.isHorizontal) {
      this.last.x += this.speed * elapsedMs;
    } else {
      this.last.y += this.speed * elapsedMs;
    }
    this.normalizeAndRender(camera, foreground);
  }

  /**
   * Draw a layer that moves in relation to the camera center point
   *
   * NB: the efficiency of this code derives from the assumption that the
   *     camera does not move suddenly
   *
   * @param camera     The camera for the world that these layers accompany
   * @param foreground Does this go in the foreground (true) or background
   *                   (false)?
   */
  private renderRelative(camera: CameraService, foreground: boolean) {
    // Determine the change in camera
    let x = camera.getLeft(); // left of viewport
    let y = camera.getTop(); // top of viewport
    let dx = x - this.lastCam.x;
    let dy = y - this.lastCam.y;
    // Determine the relative change to the reference tile
    if (this.isHorizontal) {
      this.last.x = this.last.x + dx * this.speed;
    } else {
      this.last.y = this.last.y + dy * this.speed;
    }
    this.normalizeAndRender(camera, foreground);
  }

  /**
   * This is how we actually figure out where to draw the background
   *
   * @param camera     The camera for the world that these layers accompany
   * @param foreground Does this go in the foreground (true) or background
   *                   (false)?
   */
  private normalizeAndRender(camera: CameraService, foreground: boolean) {
    let x = camera.getLeft(); // left of viewport
    let y = camera.getTop(); // top of viewport
    // Normalize the reference tile: pick the tile whose left/top edge is at or
    // before x/y, and whose far edge is past it.  This is `last.x/y` modulo the
    // tile size, offset to be relative to `x`/`y`.  Doing it via modulo keeps
    // this O(1).
    if (this.isHorizontal) {
      let w = this.images[0].width;
      this.last.x = x - (((x - this.last.x) % w) + w) % w;
    } else {
      let h = this.images[0].height;
      this.last.y = y - (((y - this.last.y) % h) + h) % h;
    }
    // save camera for next render
    this.lastCam.x = x;
    this.lastCam.y = y;
    this.renderVisibleTiles(camera, foreground);
  }

  /**
   * Given the x,y coordinates of a reference tile, render the tiles of a layer
   * that are visible
   *
   * @param camera     The camera for the world that these layers accompany
   * @param foreground Does this go in the foreground (true) or background
   *                   (false)?
   */
  private renderVisibleTiles(camera: CameraService, foreground: boolean) {
    let x = camera.getLeft(); // left of viewport
    let y = camera.getTop(); // top of viewport
    let camW = stage.screenWidth / stage.pixelMeterRatio;
    let camH = stage.screenHeight / stage.pixelMeterRatio;
    if (this.isHorizontal) {
      let i = 0;
      let plx = this.last.x;
      while (plx < x + camW) {
        let cx = plx + this.images[i].width / 2;
        let cy = this.last.y + this.images[i].height / 2;
        this.images[i].renderAsParallax({ cx, cy }, camera, foreground);
        plx += this.images[i].width;
        i++;
      }
    }
    else {
      let i = 0;
      let ply = this.last.y;
      while (ply < y + camH) {
        let cx = this.last.x + this.images[i].width / 2;
        let cy = ply + this.images[i].height / 2;;
        this.images[i].renderAsParallax({ cx, cy }, camera, foreground);
        ply += this.images[i].height;
        i++;
      }
    }
  }
}

/**
 * ParallaxSystems present a set of images that seem to scroll relative to the
 * position of the actor on whom the camera is centered.
 *
 * The speeds of layers are a very important concept.
 * - 1 means "moves at same speed as hero", which means "fixed position"
 * - 0 means "doesn't move", which means "looks like a tiled background"
 * - in-between should be interesting
 * - negative means "moves too fast"
 */
export class ParallaxSystem {
  /** All the layers to show */
  private layers: ParallaxLayer[] = [];

  /**
   * Add a parallax layer to the current level
   *
   * @param cfg.anchor        The position of one instance of the image.  All
   *                          other instances will be tiled from this point.
   * @param cfg.speed         Speed that the picture seems to move.
   * @param cfg.isHorizontal  True for moving in X, false for moving in Y
   * @param cfg.isAuto        Should the image scroll automatically, or in
   *                          relation to the camera position?
   * @param imageMaker        Code for making each ImageSprite or AnimatedSprite
   */
  public addLayer(cfg: { anchor: { cx: number, cy: number }, speed: number, isHorizontal?: boolean, isAuto?: boolean }, imageMaker: () => (ImageSprite | AnimatedSprite)) {
    this.layers.push(new ParallaxLayer({
      anchor: cfg.anchor,
      speed: cfg.speed,
      isHorizontal: cfg.isHorizontal == undefined ? true : !!cfg.isHorizontal,
      isAuto: !!cfg.isAuto,
    }, imageMaker));
  }

  /**
   * Render all of the layers of this parallax scene
   *
   * @param camera     The camera for the world that these layers accompany
   * @param elapsedMs  The time since the last render
   * @param foreground Does this go in the foreground (true) or background
   *                   (false)?
   */
  public render(camera: CameraService, elapsedMs: number, foreground: boolean) {
    this.layers.forEach(pl => pl.render(camera, elapsedMs, foreground));
  }
}
