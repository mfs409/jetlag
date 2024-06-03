import { Filter } from "pixi.js";

/**
 * FilterComponent is a wrapper around a Pixi.js filter.  It provides a clean
 * interface by which:
 *   1. Programmers can wrap arbitrary Pixi filters
 *   2. Programmers can attach filters to a Z plane or to WORLD/OVERLAY/HUD
 *   3. Programmers can leverage custom logic for updating their filters
 */
export interface FilterComponent {
  /** Return the Pixi.Filter object(s) for this FilterComponent */
  getFilters(): Filter[];

  /**
   * Run an update task on each render step.  This is useful for filters that
   * change dynamically.
   *
   * @param elapsedMs The time since the last call to preRender()
   *
   * @returns A boolean indicating whether this filter should be applied during
   *          this render step or not.
   */
  preRender(elapsedMs: number): boolean;
}
