import { Assets, Graphics, Sprite as PixiSprite, Text as PixiText, Texture } from "pixi.js";
import { stage } from "../Stage";

/** DebugSprite is used when we need to render a debug outline on an actor */
export class DebugSprite {
  /** The PIXI context that we use for making the shape's outline */
  readonly shape = new Graphics();

  /** A radial line when debugShape is a circle, to show rotation */
  readonly line = new Graphics();
}

/** A sprite is any picture that can be drawn to the screen */
export class Sprite {
  /** A debug context, for when we need to print shape outlines */
  readonly debug = new Graphics();

  /**
   * Construct a sprite
   *
   * @param imgName the name of the image file to load
   * @param sprite The PIXI sprite to use
   */
  constructor(readonly imgName: string, public sprite: PixiSprite) { }

  /**
   * Set the position of the sprite relative to some X/Y anchor point
   *
   * @param ax The X anchor
   * @param ay The Y anchor
   * @param x The X position relative to the anchor
   * @param y The Y position relative to the anchor
   */
  setAnchoredPosition(ax: number, ay: number, x: number, y: number) {
    this.sprite.anchor.set(ax, ay);
    this.sprite.position.set(x, y);
  }
}

/** Text is for anything that we render by using a string and a font */
export class Text {
  /** A debug context, for when we need to print the text's outline */
  readonly debug = new Graphics();

  /**
   * Create a Text object by wrapping a PIXI text
   *
   * @param text A PIXI text object
   */
  private constructor(readonly text: PixiText) { }

  /**
   * Create some text, with the font size scaled according to the stage's
   * current scale.
   *
   * @param txt The text to show
   * @param cfg PIXI options for the text
   */
  public static makeText(txt: string, cfg: any) {
    cfg.fontSize = Math.floor(cfg.fontSize * stage.fontScaling);
    // `lineHeight` needs to scale right along with `fontSize`, or multi-line
    // text will end up with the wrong line spacing relative to its font size
    // once the stage's scale isn't 1.
    if (cfg.lineHeight !== undefined) cfg.lineHeight = Math.floor(cfg.lineHeight * stage.fontScaling);
    return new Text(new PixiText({ text: txt, style: cfg }));
  }
}

/**
 * ImageService provides a library of image objects that can be used at any
 * time.
 */
export class ImageLibraryService {
  /**
   * A map with all of the game's image-based textures in it.  This is slightly
   * easier than using PIXI.Assets directly, since we don't have to deal with
   * promises, but of course that means we handle the caching ourselves.
   */
  private imgTextures = new Map<string, Texture>();

  /** A map with all of the game's video-based textures in it. */
  private vidTextures = new Map<string, Texture>();

  /**
   * Track the progress of image loading, on a scale from 0 to 1, where 1
   * means "100% loaded".  "2" means post-loading steps are also complete.
   */
  public imageLoadingProgress = 2;

  /** Track the progress of font loading, the same way as `imageLoadingProgress`. */
  public fontLoadingProgress = 2;

  /** Track the progress of video loading, the same way as `imageLoadingProgress`. */
  public videoLoadingProgress = 2;

  /**
   * Create the service.  This does not load any assets; that happens via
   * `loadFonts`/`loadImageList`/`loadVideos`, which are invoked by Stage.
   */
  constructor() {
    // basePath isn't set by default, so PIXI won't resolve relative asset paths
    // until we set it.  We have to set it to the current directory, not the
    // current file URL.
    Assets.resolver.basePath = new URL(".", window.location.href).href;
  }

  /**
   * Load fonts into Pixi, so that we can be sure they are available before
   * Pixi tries to use the fonts to render text.
   *
   * @param names   An array of font names
   * @param prefix  A prefix to append to each font name that needs to be
   *                loaded
   */
  async loadFonts(names: string[], prefix: string) {
    if (names.length === 0) return;
    for (let fontName of names) {
      Assets.add({ alias: fontName, src: prefix + fontName });
    }
    await Assets.load(names, (p) => { this.fontLoadingProgress = p; });
    this.fontLoadingProgress = 2;
  }

  /**
   * Load images into Pixi, so that we can be sure they are available before
   * Pixi tries to use the images to make sprites
   *
   * @param names   An array of image names
   * @param prefix  A prefix to append to each image name that needs to be
   *                loaded
   */
  async loadImageList(names: string[], prefix: string) {
    if (names.length === 0) return;

    for (let imgName of names) {
      Assets.add({ alias: imgName, src: prefix + imgName });
    }

    // Split into 5 batches, so we can report progress incrementally
    const batchSize = Math.ceil(names.length / 5);
    const batches: string[][] = [];
    for (let i = 0; i < names.length; i += batchSize) {
      batches.push(names.slice(i, i + batchSize));
    }

    // Load each batch sequentially
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      let textures = await Assets.load(batch, (p) => {
        // Scale progress: completed batches + current batch's progress
        this.imageLoadingProgress = (batchIndex + p) / batches.length;
      });

      // Process textures from this batch
      for (let imgName of batch) {
        // If we loaded a sprite sheet, then we need to deconstruct it to get
        // all its image names.  Otherwise it's easy...
        if (imgName.endsWith(".json")) {
          for (let o of Object.keys(textures[imgName].textures))
            this.imgTextures.set(o, textures[imgName].textures[o]);
        }
        else {
          this.imgTextures.set(imgName, textures[imgName]);
        }
      }
    }

    this.imageLoadingProgress = 2;
  }

  /**
   * Load videos into Pixi, so that we can be sure they are available before
   * Pixi tries to use them for cut scenes.
   *
   * @param names   An array of video names
   * @param prefix  A prefix to append to each video name that needs to be
   *                loaded
   */
  async loadVideos(names: string[], prefix: string) {
    if (names.length === 0) return;
    for (let vidName of names) {
      Assets.add({ alias: vidName, src: prefix + "/" + vidName, data: { autoPlay: false, preload: true } });
    }
    const textures = await Assets.load(names, (p) => { this.videoLoadingProgress = p; });
    for (let vidName of names) this.vidTextures.set(vidName, textures[vidName]);
    this.videoLoadingProgress = 2;
  }

  /**
   * Get an image that has been loaded by the renderer
   *
   * @param imgName The name of the image to load
   *
   * @returns A Sprite built from the image
   */
  public getSprite(imgName: string) {
    let texture = this.imgTextures.get(imgName);
    if (!texture) {
      throw `Unable to find graphics asset '${imgName}'`;
    }
    return new Sprite(imgName, new PixiSprite(texture));
  }

  /**
   * Get an image that has been loaded by the renderer, returning it as a raw
   * Pixi Texture
   *
   * @param imgName The name of the image to load
   *
   * NB:  This returns the shared, cached Texture.  If you want to modify it,
   *      clone it first, or every other sprite using this image will see the
   *      change too.
   *
   * @returns A Texture built from the image
   */
  public getImageAsTexture(imgName: string) {
    let texture = this.imgTextures.get(imgName);
    if (!texture) {
      throw `Unable to find graphics asset '${imgName}'`;
    }
    return texture;
  }

  /**
   * Get a video that has been loaded by the renderer
   *
   * @param vidName The name of the video to load
   *
   * @returns A Sprite built from the video
   */
  public getVideo(vidName: string) {
    let texture = this.vidTextures.get(vidName);
    if (!texture) {
      throw `Unable to find graphics asset '${vidName}'`;
    }
    return new Sprite(vidName, new PixiSprite(texture));
  }
}
