import { Scene } from "./Entities/Scene";
import { ParallaxSystem } from "./Services/Parallax";
import { GestureDevice } from "./Devices/Gesture";
import { AudioLibraryService } from "./Services/AudioLibrary";
import { MusicComponent } from "./Components/Music";
import { NetworkDevice } from "./Devices/Network";
import { ScoreService } from "./Services/Score";
import { RandomService } from "./Services/Random";
import { JetLagGameConfig } from "./Config";
import { ConsoleDevice } from "./Devices/Console";
import { KeyboardDevice } from "./Devices/Keyboard";
import { GamepadDevice } from "./Devices/Gamepad";
import { RendererDevice, SpriteLocation } from "./Devices/Renderer";
import { AccelerometerMode, AccelerometerDevice } from "./Devices/Accelerometer";
import { StorageDevice } from "./Devices/Storage";
import { TiltService } from "./Services/Tilt";
import { AdvancedCollisionService, BasicCollisionService } from "./Services/Collisions";
import { ImageLibraryService } from "./Services/ImageLibrary";
import { ImageSprite, MIN_Z_INDEX } from "./Components/Appearance";
import { HtmlPlatformDevice, PlatformDevice } from "./Devices/Platform";
import { VisibilityDevice } from "./Devices/Visibility";
import { TextToSpeechDevice } from "./Devices/TextToSpeech";

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

  /** The current overlay (pause/win/lose) scene, if any */
  public overlay?: Scene;

  /** Background color for the stage being drawn.  Defaults to white */
  public backgroundColor = "#ffffff";

  /** The background layers */
  public background!: ParallaxSystem;

  /** The foreground layers */
  public foreground!: ParallaxSystem;

  /** Music that is controlled on one level at a time */
  public get levelMusic() { return this._levelMusic; }

  /** Music that is controlled on one level at a time */
  public set levelMusic(m: MusicComponent | undefined) {
    this._levelMusic?.stop();
    this._levelMusic = m;
    m?.play();
  }

  /** Music that is controlled on one level at a time */
  private _levelMusic: MusicComponent | undefined;

  /** The Score, suitable for use throughout JetLag */
  readonly score = new ScoreService();

  /** A seedable random number generator, for reproducible randomness */
  readonly random = new RandomService();

  /** A console device, for debug messages */
  readonly console: ConsoleDevice;

  /** touch controller, providing gesture inputs */
  public gestures!: GestureDevice;

  /** keyboard controller, providing key event inputs */
  readonly keyboard = new KeyboardDevice();

  /**
   * Up to four gamepad slots, matching `navigator.getGamepads()`'s indices.
   * Each entry always exists (check `.connected` before using one), so
   * `stage.gamepads[0]` never throws even if nothing's plugged in yet.
   */
  readonly gamepads: GamepadDevice[] = [0, 1, 2, 3].map(i => new GamepadDevice(i));

  /** access to the the device's accelerometer */
  readonly accelerometer: AccelerometerDevice;

  /** rendering support, for drawing to the screen */
  readonly renderer: RendererDevice;

  /** A library of sound and music files */
  readonly musicLibrary: AudioLibraryService;

  /** A library of images */
  readonly imageLibrary = new ImageLibraryService();

  /** Background music that doesn't stop when the level changes */
  public get gameMusic() { return this._gameMusic; }

  /** Background music that doesn't stop when the level changes */
  public set gameMusic(m: MusicComponent | undefined) {
    this._gameMusic?.stop();
    this._gameMusic = m;
  }

  /** Background music that doesn't stop when the level changes */
  private _gameMusic: MusicComponent | undefined;

  /** Persistent storage + volatile storage for a game session and a level */
  readonly storage = new StorageDevice();

  /** Network interface */
  readonly network: NetworkDevice = new NetworkDevice();

  /** Page visibility detection support */
  readonly visibility = new VisibilityDevice();

  /** Text-to-speech support */
  readonly speech: TextToSpeechDevice = new TextToSpeechDevice();

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
  public requestOverlay(builder: (overlay: Scene, screenshot?: ImageSprite) => void, requestScreenshot: boolean = false) {
    if (!requestScreenshot) {
      this.overlay = new Scene(this.pixelMeterRatio, new BasicCollisionService());
      builder(this.overlay, undefined);
      return;
    }

    // clear the last screenshot (the setter destroys it), request a new one
    this.renderer.mostRecentScreenShot = undefined;
    this.renderer.screenshotRequested = true;

    let action = () => {
      if (this.renderer.mostRecentScreenShot) {
        let screenshot = new ImageSprite({
          width: this.screenWidth / this.pixelMeterRatio,
          height: this.screenHeight / this.pixelMeterRatio,
          img: this.renderer.mostRecentScreenShot,
          z: MIN_Z_INDEX
        });
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
   * Update every gamepad slot from the browser's live gamepad state, and fire
   * any button handlers whose pressed state changed
   */
  public pollGamepads() {
    const raw = navigator.getGamepads?.() ?? [];
    this.gamepads.forEach(g => g.poll(raw[g.index]));
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

    // Only set the color if we don't have an overlay showing
    this.renderer.setFrameColor(this.backgroundColor);

    // Update the win/lose countdown timers and the stopwatch.  This might
    // end the level via `switchTo()`, which synchronously replaces
    // `this.world`/`background`/`foreground` and runs the new level's
    // builder.  If that happens, make sure we don't keep rendering.
    const worldBeforeTick = this.world;
    this.score.onClockTick(elapsedMs);
    if (this.overlay || this.world !== worldBeforeTick) return;

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
    if (this.overlay) return;

    this.hud.physics!.world.Step(elapsedMs / 1000, { velocityIterations: 8, positionIterations: 3 });
    this.hud.runRendertimeEvents();
    this.hud.timer.advance(elapsedMs);
    this.hud.camera.render(elapsedMs, SpriteLocation.HUD);
  }

  /**
   * Before we call programmer code to load a new stage, we call this to
   * ensure that everything is in a clean state.
   */
  public switchTo(builder: () => void) {
    // clear any overlay left over from the previous stage
    this.clearOverlay();

    // reset music (the setter stops whatever was playing)
    this.levelMusic = undefined;

    // reset score and storage
    this.score.reset();
    this.storage.clearLevelStorage();

    // reset keyboard, gesture, and gamepad handlers, since they aren't part of
    // the world
    this.keyboard.clearHandlers();
    this.gestures.reset();
    this.gamepads.forEach(g => g.clearHandlers());

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
    builder();
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
  constructor(readonly config: JetLagGameConfig, private domId: string, private builder: () => void, readonly platform: PlatformDevice) {
    this.console = new ConsoleDevice(config);

    // Check if the config needs to be adapted, then check for errors
    if (config.aspectRatio.width <= 0 || config.aspectRatio.height <= 0) {
      this.console.log("Invalid `aspectRatio` in game config object");
    }
    this.computeScreenDimensions();

    // Configure the services that depend on `cfg` or `computeScreenDimensions`
    this.musicLibrary = new AudioLibraryService(config);
    this.accelerometer = new AccelerometerDevice(config.accelerometerMode ?? AccelerometerMode.DISABLED);
    this.renderer = new RendererDevice(this.screenWidth, this.screenHeight, domId, this.config.hitBoxes);

    // Start at half volume.  Games that want persistent volume controls can
    // read/write their own storage key and call resetMusicVolume() themselves.
    this.musicLibrary.resetMusicVolume(0.5);

    // Configure any systems that should be running
    this.tilt = new TiltService;
  }

  /**
   * Load any images that need to be loaded, then launch the game.  This is the
   * last step in starting a game.
   */
  public async begin() {
    // Finish initializing the Pixi renderer (Pixi v8 requires this be async)
    await this.renderer.initialize();

    const resources = this.config.resources;
    const prefix = resources?.prefix ?? "";
    const loadingScreenFonts = resources?.loadingScreenFonts ?? [];
    const loadingScreenImageNames = resources?.loadingScreenImageNames ?? [];

    if (loadingScreenFonts.length > 0 || loadingScreenImageNames.length > 0) {
      // A loading screen is configured: load just enough to draw it and
      // start the builder
      await this.imageLibrary.loadFonts(loadingScreenFonts, prefix);
      await this.imageLibrary.loadImageList(loadingScreenImageNames, prefix);
    } else {
      // No loading screen configured: load everything up front, so that simple
      // games and tutorial demos don't need to deal with a loading screen
      if (resources?.videoNames) await this.imageLibrary.loadVideos(resources.videoNames, prefix);
      await this.imageLibrary.loadFonts(resources?.fonts ?? [], prefix);
      await this.imageLibrary.loadImageList(resources?.imageNames ?? [], prefix);
    }

    this.gestures = new GestureDevice(this.domId, this);
    this.switchTo(this.builder);
    this.renderer.startRenderLoop();
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
    // Whichever dimension is more constraining determines the height; the
    // other dimension follows from `targetRatio`.
    this.screenHeight = Math.min(screen.y, screen.x / targetRatio);
    this.screenWidth = this.screenHeight * targetRatio;
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
 * NB: `platform` is for future use with mobile / desktop deploy targets.
 *
 * @param domId     The name of the DIV into which the game should be placed
 * @param config    The game configuration object
 * @param builder   A function for building the first visible level of the game
 * @param platform  Platform-specific features.  Defaults to HTML5
 */
export async function initializeAndLaunch(domId: string, config: JetLagGameConfig, builder: () => void, platform: PlatformDevice = new HtmlPlatformDevice()) {
  stage = new Stage(config, domId, builder, platform);
  await stage.begin();
}

/** A global reference to the Stage, suitable for use throughout JetLag */
export let stage: Stage;
