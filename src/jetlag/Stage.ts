import { Scene } from "./Entities/Scene";
import { ParallaxSystem } from "./Services/Parallax";
import { GestureDevice } from "./Devices/Gesture";
import { AudioLibraryService } from "./Services/AudioLibrary";
import { MusicComponent } from "./Components/Music";
import { NetworkDevice } from "./Devices/Network";
import { ScoreService } from "./Services/Score";
import { JetLagGameConfig } from "./Config";
import { ConsoleDevice } from "./Devices/Console";
import { KeyboardDevice } from "./Devices/Keyboard";
import { RendererDevice, SpriteLocation } from "./Devices/Renderer";
import { AccelerometerMode, AccelerometerDevice } from "./Devices/Accelerometer";
import { StorageDevice } from "./Devices/Storage";
import { TiltService } from "./Services/Tilt";
import { AdvancedCollisionService, BasicCollisionService } from "./Services/Collisions";
import { ImageLibraryService } from "./Services/ImageLibrary";
import { ImageSprite } from "./Components/Appearance";
import { HtmlPlatformDevice, PlatformDevice } from "./Devices/Platform";

/**
 * PPM4UF: Pixels per Meter for Unscaled Fonts.  This is an empirically derived
 * value that represents the pixel-per-meter ratio at which font sizes do not
 * need to be scaled in order for a font value in the game to match what you'd
 * expect.
 */
const PPM4UF = 75;

/**
 * PPM4SVG: Pixels per Meter for SVG.  This is an empirically derived value that
 * represents the pixel-per-meter ratio at which SVG files do not require
 * scaling.
 */
const PPM4SVG = 75;

/**
 * Stage is the container for all of the functionality for the playable portion
 * of a game.  Stage has several components:
 * - The world, where all the action of the game happens
 * - The heads-up display (HUD), where the user interface of the game is drawn.
 * - The Score object
 * - The background music and background color
 * - The background and foreground parallax layers
 * - The code for building, managing, and dismissing the win/lose/pause/welcome
 *   scenes
 *
 * Stage is effectively a singleton: On any transition from one stage to another
 * in the game, we don't make a new Stage object... instead we clear out the
 * existing one and reuse it.
 *
 * Stage does not manage transitions between scenes on its own. Instead, it has
 * mechanisms (onScreenChange and endLevel) for resetting itself at the
 * beginning of a stage, and cleaning itself up at the end of a stage.
 */
export class Stage {
  /** The physics world in which all actors exist */
  public world!: Scene;
  /** A heads-up display */
  public hud!: Scene;
  /** The tilt system for the stage */
  readonly tilt: TiltService;
  /** Any pause, win, or lose scene that supersedes the world and hud */
  public overlay?: Scene;
  /** Background color for the stage being drawn.  Defaults to white */
  public backgroundColor = "#ffffff";
  /** The background layers */
  public background!: ParallaxSystem;
  /** The foreground layers */
  public foreground!: ParallaxSystem;
  /** Everything related to music that is controlled on one level at a time */
  public levelMusic: MusicComponent | undefined;
  /** The Score, suitable for use throughout JetLag */
  readonly score = new ScoreService();
  /** A console device, for debug messages */
  readonly console: ConsoleDevice;
  /** touch controller, providing gesture inputs */
  public gestures!: GestureDevice;
  /** keyboard controller, providing key event inputs */
  readonly keyboard: KeyboardDevice;
  /** access to the the device's accelerometer */
  readonly accelerometer: AccelerometerDevice;
  /** rendering support, for drawing to the screen */
  readonly renderer: RendererDevice;
  /** A library of sound and music files */
  readonly musicLibrary: AudioLibraryService;
  /** A library of images */
  readonly imageLibrary: ImageLibraryService;
  /** Background music that doesn't stop when the level changes */
  public gameMusic: MusicComponent | undefined;
  /** Persistent storage + volatile storage for a game session and a level */
  readonly storage: StorageDevice;
  /** Network interface */
  readonly network: NetworkDevice = new NetworkDevice();
  /** Scaling ratio for fonts, relative to PPM4UF */
  fontScaling = 1;
  /** The screen width (dummy value... gets computed early) */
  screenWidth = 0;
  /** The screen height (dummy value... gets computed early) */
  screenHeight = 0;
  /** The pixel-meter ratio (dummy value... gets computed early) */
  pixelMeterRatio = 0;
  /** The scaling ratio for SVG coords, relative to PPM4SVG */
  svgScaling = 1;
  /** Code to run at the end of the next render step (used for screenshots) */
  private afterRender?: () => void;

  /**
   * Request that an overlay be put on top of the game.  This is *not* the HUD.
   * It's something that goes on top of everything else, and prevents the game
   * from playing, such as a pause scene, a win/lose scene, or a welcome scene.
   *
   * @param builder           Code for creating the overlay
   * @param requestScreenshot Should the overlay delay for a cycle or two, so a
   *                          screenshot can be taken first?
   */
  public requestOverlay(builder: (overlay: Scene, screenshot?: ImageSprite) => void, requestScreenshot: boolean) {
    if (!requestScreenshot) {
      this.overlay = new Scene(this.pixelMeterRatio, new BasicCollisionService());
      builder(this.overlay, undefined);
      return;
    }

    // clear the last screenshot, request a new one
    if (this.renderer.mostRecentScreenShot) {
      this.renderer.mostRecentScreenShot.destroy(true);
      this.renderer.mostRecentScreenShot = undefined;
    }
    this.renderer.screenshotRequested = true;

    let action = () => {
      if (this.renderer.mostRecentScreenShot) {
        let screenshot = new ImageSprite({
          width: this.screenWidth / this.pixelMeterRatio,
          height: this.screenHeight / this.pixelMeterRatio,
          img: "",
          z: -2
        });
        screenshot.overrideImage(this.renderer.mostRecentScreenShot);
        this.overlay = new Scene(this.pixelMeterRatio, new BasicCollisionService());
        builder(this.overlay, screenshot);
        this.afterRender = undefined;
      }
      else {
        this.afterRender = action;
      }
    }
    this.afterRender = action;
  }

  /** Remove the current overlay scene, if any */
  public clearOverlay() {
    this.overlay = undefined;
    this.renderer.resetOverlay();
  }

  /**
   * Render the overlay if it exists.  This code is called dozens of times per
   * second to update the overlay, if it is being drawn.
   *
   * @param elapsedMs The time in milliseconds since the previous render
   */
  public renderOverlay(elapsedMs: number) {
    if (!this.overlay) return;
    this.overlay.physics!.world.Step(elapsedMs / 1000, { velocityIterations: 8, positionIterations: 3 });
    this.overlay.timer.advance(elapsedMs);
    this.overlay.runRendertimeEvents();
    // NB:  The timer might cancel the overlay, so we can't assume it's still
    //      valid...
    this.overlay?.camera.render(elapsedMs, SpriteLocation.OVERLAY);
  }

  /**
   * This code is called dozens of times per second to update the game's world's
   * state and re-draw the world
   *
   * @param elapsedMs The time in milliseconds since the previous render
   */
  public renderWorld(elapsedMs: number) {
    // If we've got an overlay, don't render the world
    if (this.overlay) return;

    // Only set the color and play music if we don't have an overlay showing
    this.renderer.setFrameColor(this.backgroundColor as any);
    this.levelMusic?.play();

    // Update the win/lose countdown timers and the stopwatch.  This might end
    // the level.
    this.score.onClockTick(elapsedMs);

    // handle accelerometer stuff... note that accelerometer is effectively
    // disabled during an overlay... we could change that by moving this to the
    // top, but that's probably not going to produce logical behavior
    this.tilt.handleTilt();

    // Advance the physics world
    this.world.physics!.world.Step(elapsedMs / 1000, { velocityIterations: 8, positionIterations: 3 })

    // Run any pending world events, and clear one-time events
    this.world.runRendertimeEvents();

    // Determine the center of the camera's focus
    this.world.camera.adjustCamera();

    // The world is now static for this time step... we can display it!
    this.world.timer.advance(elapsedMs);
    this.background.render(this.world.camera, elapsedMs, false);
    this.world.camera.render(elapsedMs, SpriteLocation.WORLD);
    this.foreground.render(this.world.camera, elapsedMs, true);

    // Run post-render tasks
    if (this.afterRender) this.afterRender();
  }

  /**
   * This code is called dozens of times per second to update the game's hud's
   * state and re-draw the hud
   *
   * @param elapsedMs The time in milliseconds since the previous render
   */
  public renderHud(elapsedMs: number) {
    // If we've got an overlay, don't draw the HUD
    if (this.overlay) {
      return;
    }

    this.hud.physics!.world.Step(elapsedMs / 1000, { velocityIterations: 8, positionIterations: 3 });
    this.hud.runRendertimeEvents();
    this.hud.timer.advance(elapsedMs);
    this.hud.camera.render(elapsedMs, SpriteLocation.HUD);
  }

  /**
   * Before we call programmer code to load a new stage, we call this to
   * ensure that everything is in a clean state.
   */
  public switchTo(builder: (index: number, stage: Stage) => void, index: number) {
    // reset music
    this.levelMusic?.stop();
    this.levelMusic = undefined;

    // reset score and storage
    this.score.reset();
    this.storage.clearLevelStorage();

    // reset keyboard and gesture handlers, since they aren't part of the world
    this.keyboard.clearHandlers();
    this.gestures.reset();

    // reset other fields to default values
    this.backgroundColor = "#ffffff";

    // Reset the renderer
    this.renderer.reset();

    // Just re-make the scenes and systems, instead of clearing the old ones
    this.world = new Scene(this.pixelMeterRatio, new AdvancedCollisionService());
    (this.world.physics as AdvancedCollisionService).setScene(this.world);
    this.hud = new Scene(this.pixelMeterRatio, new BasicCollisionService());
    this.background = new ParallaxSystem();
    this.foreground = new ParallaxSystem();
    this.tilt.reset();

    // Now run the level
    builder(index, this);
  }

  /**
   * Set up the stage.  This is the first step in starting a game.
   *
   * @param config    The game-wide configuration object
   * @param domId     The Id of the DOM element where the game exists
   * @param builder   A function for building the first visible level of the
   *                  game
   * @param platform  Platform-specific features
   */
  constructor(readonly config: JetLagGameConfig, private domId: string, private builder: (level: number) => void, readonly platform: PlatformDevice) {
    this.console = new ConsoleDevice(config);

    // Check if the config needs to be adapted, then check for errors
    if (config.aspectRatio.width <= 0 || config.aspectRatio.height <= 0)
      this.console.log("Invalid `aspectRatio` in game config object");
    this.computeScreenDimensions();

    // Configure the services
    this.storage = new StorageDevice();
    this.musicLibrary = new AudioLibraryService(config);
    this.keyboard = new KeyboardDevice();
    this.accelerometer = new AccelerometerDevice(config.accelerometerMode ?? AccelerometerMode.DISABLED);
    this.renderer = new RendererDevice(this.screenWidth, this.screenHeight, domId, this.config.hitBoxes);
    this.imageLibrary = new ImageLibraryService(config);

    // make sure the volume is reset to its old value
    this.musicLibrary.resetMusicVolume(parseInt(this.storage.getPersistent("volume") ?? "1"));

    // Configure any systems that should be running
    this.tilt = new TiltService;
  }

  /**
   * Load any images that need to be loaded, then launch the game.  This is the
   * last step in starting a game.
   */
  public begin() {
    // Load the images asynchronously, then start rendering
    this.imageLibrary.loadAssets(() => {
      this.gestures = new GestureDevice(this.domId, this);
      this.switchTo(this.builder, 1);
      this.renderer.startRenderLoop();
    });
  }

  /**
   * Compute the dimensions of the canvas into which the game will be drawn. Use
   * this.config to determine the target ratio, then do a ratio-preserving
   * expansion of the resulting box until it fills the screen in one dimension.
   */
  private computeScreenDimensions() {
    // Compute the target aspect ratio, which must be preserved
    let targetRatio = this.config.aspectRatio.width / this.config.aspectRatio.height;
    // Get the maximum x and y, based on the browser dimensions
    let screen = { x: window.innerWidth, y: window.innerHeight };
    if (screen.y * targetRatio < screen.x) {
      // vertical is constraining
      this.screenHeight = screen.y;
      this.screenWidth = screen.y * targetRatio;
    } else {
      // Horizontal is constraining
      this.screenWidth = screen.x;
      this.screenHeight = screen.x / targetRatio;
    }
    // Compute the pixel/meter ratio and the font scaling ratio.
    // NB: A font scale of 1 corresponds to a 100 pixel/meter ratio
    this.pixelMeterRatio = this.screenWidth / this.config.aspectRatio.width;
    this.fontScaling = this.pixelMeterRatio / PPM4UF;
    this.svgScaling = this.pixelMeterRatio / PPM4SVG;
  }

  /** Close the window to exit the game */
  public exit() {
    this.levelMusic?.stop();
    this.gameMusic?.stop();
    this.platform.quitter();
  }
}

/**
 * Start a game
 *
 * NB:  The `beforeBegin` method is only used when generating demos for the
 *      book, and `platform` is only used when deploying to mobile or desktop.
 *      If you need to use `platform`, then you can provide `()=>{}` as the
 *      beforeBegin function.
 *
 * @param domId       The name of the DIV into which the game should be placed
 * @param config      The game configuration object
 * @param builder     A function for building the first visible level of the
 *                    game
 * @param beforeBegin A function to run before the builder runs.  This is used
 *                    by the book build system, and should be ()=>{} otherwise.
 * @param platform    Platform-specific features.  Defaults to HTML5
 */
export function initializeAndLaunch(domId: string, config: JetLagGameConfig, builder: (level: number) => void, beforeBegin: () => void = () => { }, platform: PlatformDevice = new HtmlPlatformDevice()) {
  stage = new Stage(config, domId, builder, platform);
  beforeBegin();
  stage.begin();
}

/** A global reference to the Stage, suitable for use throughout JetLag */
export let stage: Stage;
