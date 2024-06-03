import { AsciiFilter, BlurFilter, ColorOverlayFilter, EmbossFilter, FilterComponent, GodrayFilter, GrayscaleFilter, HslAdjustmentFilter, NoiseFilter, OldFilmFilter } from "../jetlag";

/** A FilterComponent for blurring */
export class BlurFilterComponent implements FilterComponent {
  /** The PIXI filter for blurring */
  private blur_filter: BlurFilter = new BlurFilter();

  /** A boolean for toggling this component */
  public enabled = true;

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.blur_filter]; }

  /** Update the filter on each render step, and report if it's active */
  preRender(_elapsedMs: number) { return this.enabled; }
}

/** A FilterComponent for making everything into ASCII */
export class AsciiFilterComponent implements FilterComponent {
  /** The PIXI filter for ASCII */
  private ascii_filter = new AsciiFilter(8);

  /** A boolean for toggling this component */
  public enabled = true;

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.ascii_filter]; }

  /** Update the filter on each render step, and report if it's active */
  preRender(_elapsedMs: number) { return this.enabled; }
}

/** A filter component for making everything gray */
export class GrayscaleFilterComponent implements FilterComponent {
  /** A color overlay filter, from the pixi filters */
  private grayscale_filter = new GrayscaleFilter();

  /** a boolean for toggling this component */
  public enabled = true;

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.grayscale_filter]; }

  /** Update the filter on each render step, and report if it's active */
  preRender(_elapsedMs: number) {
    return this.enabled;
  }
}

/** A filter component for emboss */
export class EmbossFilterComponent implements FilterComponent {
  /** The PIXI filter for emboss */
  private emboss_filter = new EmbossFilter(.1);

  /** A boolean for toggling this component */
  public enabled = true;

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.emboss_filter]; }

  /** Update the filter on each render step, and report if it's active */
  preRender(_elapsedMs: number) { return this.enabled; }
}

/** A filter component to make things look sandy-colored */
export class HSLSandFilterComponent implements FilterComponent {
  /** The PIXI filter for re-coloring the world in a sandy color */
  private sand_filter = new HslAdjustmentFilter({ hue: 33, saturation: .795, lightness: .827, colorize: true, alpha: .5 });

  /** A boolean for toggling this component */
  public enabled = true;

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.sand_filter]; }

  /** Update the filter on each render step, and report if it's active */
  preRender(_elapsedMs: number) { return this.enabled; }
}

/** A filter component that adds ever-changing noise to the scene */
export class NoiseFilterComponent implements FilterComponent {
  /** Noise for the filter */
  private noise_filter = new NoiseFilter();

  /** A boolean for toggling this component */
  public enabled = true;

  /** Return all the PIXI filters for this component */
  getFilters() {
    return [this.noise_filter];
  }

  /** Update the filter on each render step, and report if it's active */
  preRender(_elapsedMs: number) {
    if (this.enabled) { this.noise_filter.seed = Math.random(); }
    return this.enabled;
  }
}

/** A filter component for fading to black */
export class FadeOutFilterComponent implements FilterComponent {
  /** A color overlay filter, from the pixi filters */
  private overlay_filter = new ColorOverlayFilter([0, 0, 0], 0);

  /** Return all the PIXI filters for this component */
  getFilters() {
    return [this.overlay_filter];
  }

  /** a boolean for toggling this component */
  public enabled = true;

  /** Update the filter on each render step, and report if it's active */
  preRender(elapsedMs: number) {
    if (this.enabled) {
      this.overlay_filter.alpha += elapsedMs / 1500;
      if (this.overlay_filter.alpha > 1) {
        this.overlay_filter.alpha = 1;
      }
    }
    return this.enabled;
  }
}

/** A filter component for fading from black */
export class FadeInFilterComponent implements FilterComponent {
  /** A color overlay filter, from the pixi filters */
  private overlay_filter: ColorOverlayFilter;

  /** Return all the PIXI filters for this component */
  getFilters() {
    return [this.overlay_filter];
  }

  /** Construct the FilterComponent */
  constructor() {
    this.overlay_filter = new ColorOverlayFilter(0x000000, 1);
    this.overlay_filter.enabled = true;
  }

  /** a boolean for toggling this component */
  public enabled = true;

  /** Update the filter on each render step, and report if it's active */
  preRender(elapsedMs: number) {
    if (this.enabled) {
      this.overlay_filter.alpha -= elapsedMs / 1500;
      if (this.overlay_filter.alpha < 0) {
        this.overlay_filter.alpha = 0;
        this.overlay_filter.enabled = false;
        this.enabled = false;
      }
    }
    return this.enabled;
  }
}

/** A FilterComponent for a "sepia TV" effect */
export class SepiaTvFilterComponent implements FilterComponent {
  /** Noise for the filter */
  private noise_filter = new NoiseFilter();

  /** A lense effect */
  private godray_filter = new GodrayFilter();

  /** Sepia tones */
  private old_film_filter = new OldFilmFilter();

  /** A boolean for toggling this component */
  public enabled = true;

  /** Return all the PIXI filters for this component */
  getFilters() {
    return [this.noise_filter, this.godray_filter, this.old_film_filter];
  }

  /** Set up the filter */
  constructor() {
    this.old_film_filter.sepia = .3;
    this.old_film_filter.noise = .3;
    this.old_film_filter.noiseSize = 1;
    this.old_film_filter.scratch = .5;
    this.old_film_filter.scratchDensity = .3;
    this.old_film_filter.scratchWidth = 1;
    this.old_film_filter.vignetting = .3;
    this.old_film_filter.vignettingAlpha = 1;
    this.old_film_filter.vignettingBlur = .3;

    this.godray_filter.alpha = 1;
    this.godray_filter.gain = 0.6;
    this.godray_filter.lacunarity = 2.75;
  }

  /** Update the filter on each render step, and report if it's active */
  preRender(elapsedMs: number) {
    if (this.enabled) {
      this.noise_filter.seed = Math.random();
      this.godray_filter.time += elapsedMs / 1000;
    }
    return this.enabled;
  }
}
