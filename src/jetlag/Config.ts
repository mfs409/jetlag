import { AccelerometerMode } from "./Devices/Accelerometer";

/**
 * JetLagGameConfig stores game-specific configuration values.  The programmer
 * makes one of these to tell JetLag how to run their game.
 */
export interface JetLagGameConfig {
  /**
   * The width and height of the game, in meters.  Common values are 16/9
   * (landscape) and 9/16 (portrait)
   */
  readonly aspectRatio: { width: number, height: number };
  /** Should JetLag print an outline around each actor in the game? */
  readonly hitBoxes: boolean;
  /** Configuration of any assets used by the game */
  readonly resources?: {
    /**
     * An override for loading assets from a CDN url instead of the game's
     * `assets` folder.
     */
    readonly cdn?: string,
    /** The list of image files needed EARLY (for the loading screen) */
    readonly loadingScreenImageNames?: string[];
    /** The list of fonts needed EARLY (for the loading screen) */
    readonly loadingScreenFonts?: string[];
    /** The list of image files that can be used by the game */
    readonly imageNames?: string[];
    /** The list of audio files that can be used as sound effects by the game */
    readonly soundNames?: string[];
    /** The list of audio files that can be used as (looping) background music */
    readonly musicNames?: string[];
    /** The list of video files that can be used for cut scenes */
    readonly videoNames?: string[];
    /** Fonts to load */
    readonly fonts?: string[];
  };
  /** A prefix for every key in persistent storage */
  readonly storageKey?: string;
  /** Accelerometer mode (customize for each device target and orientation) */
  readonly accelerometerMode?: AccelerometerMode;
}

/** Where a game's assets live, relative to the page that loads the game */
const DEFAULT_ASSET_BASE = "./assets/";

/**
 * Compute the string that goes in front of every asset's file name, either
 * DEFAULT_ASSET_BASE or config.cdn The result always ends in a "/".
 *
 * @param config The game-wide configuration
 */
export function assetBaseUrl(config: JetLagGameConfig) {
  const cdn = config.resources?.cdn;
  if (!cdn) return DEFAULT_ASSET_BASE;
  return cdn.endsWith("/") ? cdn : cdn + "/";
}
