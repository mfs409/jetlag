import { ImageSprite } from "../Components/Appearance";
import { Scene } from "../Entities/Scene";
import { stage } from "../Stage";

/**
 * Counter is a flexible, string-keyed registry of numeric values that can be
 * used for anything a game needs to track.
 */
export class Counter {
  /** The counters, by name */
  private values = new Map<string, number>();

  /**
   * Read a counter's current value
   *
   * @param key The counter to read
   *
   * @returns The counter's value, or 0 if it has never been set
   */
  public get(key: string): number { return this.values.get(key) ?? 0; }

  /**
   * Overwrite a counter's value
   *
   * @param key   The counter to set
   * @param value The new value
   */
  public set(key: string, value: number) { this.values.set(key, value); }

  /**
   * Add to (or, with a negative amount, subtract from) a counter's value
   *
   * @param key    The counter to update
   * @param amount How much to add (negative to subtract)
   */
  public add(key: string, amount: number): void {
    this.set(key, this.get(key) + amount);
  }

  /** Clear every counter (e.g., between levels) */
  public reset(): void { this.values.clear(); }
}

/**
 * ScoreService tracks a level's progress via a `Counter` registry, and decides
 * when to win or lose the level via predicate functions that are registered
 * with `addWinCondition`/`addLoseCondition`.
 *
 * JetLag doesn't hardcode what "winning" means.  Once per clock tick,
 * ScoreService checks every registered predicate (win conditions first, then
 * lose conditions) and acts on the first one that returns true.  A predicate is
 * usually just a check against `stage.score.counters`, e.g.
 * `stage.score.addWinCondition(() => stage.score.counters.get("coins") >= 10)`.
 *
 * `stage.score.counters` entries fall into three different categories:
 * - The one counter ScoreService itself owns: `ScoreService.STOPWATCH`.
 * - Well-known counters that a Behavior updates automatically.  These are
 *   documented as public static strings on the Behavior that owns them,
 *   e.g. `HazardBehavior.ENEMIES_CREATED`/`ENEMIES_DEFEATED`, not here.
 * - Arbitrary counter keys that a game author chooses when configuring a
 *   Behavior (e.g. `CollectableBehavior.onCollect`, `GoalBehavior.onArrival`
 *   are themselves the counter key) -- these aren't "well-known" at all,
 *   since nothing about them is fixed.
 */
export class ScoreService {
  /** The counter that tracks elapsed time in the current level, in seconds */
  static readonly STOPWATCH = "stopwatch";

  /** How to build the next level if the current level is lost */
  public onLose = () => { };

  /** How to build the next level if the current level is won */
  public onWin = () => { };

  /**
   * This level's counters (goodies, enemies, the stopwatch, or anything your
   * own game code defines) 
   */
  public readonly counters = new Counter();

  /**
   * Predicates checked once per clock tick; the level is won the first time any
   * of these returns true
   */
  public winConditions: (() => boolean)[] = [];

  /**
   * Predicates checked once per clock tick (after win conditions); the level is
   * lost the first time any of these returns true
   */
  public loseConditions: (() => boolean)[] = [];

  /** Code for building an overlay to announce that current level is won */
  public winSceneBuilder?: (overlay: Scene, screenshot?: ImageSprite) => void;

  /** Code for building an overlay to announce that current level is lost */
  public loseSceneBuilder?: (overlay: Scene, screenshot?: ImageSprite) => void;

  /**
   * Has this level already been won or lost?  This field prevents re-computing,
   * to avoid a bug when a win/lose overlay requests a screenshot.
   */
  private decided = false;

  /**
   * Register a predicate that wins the level the first time it returns true
   *
   * @param condition The predicate to check every clock tick
   */
  public addWinCondition(condition: () => boolean) {
    this.winConditions.push(condition);
  }

  /**
   * Register a predicate that loses the level the first time it returns true
   *
   * @param condition The predicate to check every clock tick
   */
  public addLoseCondition(condition: () => boolean) {
    this.loseConditions.push(condition);
  }

  /** Reset all the scores at the beginning of a new level */
  public reset() {
    this.counters.reset();
    this.winConditions = [];
    this.loseConditions = [];
    this.decided = false;
  }

  /**
   * On every clock tick, advance the stopwatch, then check whether any
   * win or lose predicate now holds.  Win conditions are checked first, so
   * if a single event would satisfy both, winning takes precedence.  Once
   * the level has been won or lost, predicates stop being checked (see
   * `decided`).
   *
   * @param elapsedMs The milliseconds that have passed
   */
  public onClockTick(elapsedMs: number) {
    this.counters.add(ScoreService.STOPWATCH, elapsedMs / 1000);
    if (this.decided) return;
    if (this.winConditions.some(condition => condition())) { this.winLevel(); return; }
    if (this.loseConditions.some(condition => condition())) { this.loseLevel(); return; }
  }

  /**
   * When a playable level is won, we run this code to shut it down and then
   * either show an overlay (`winSceneBuilder`) or move straight to the next
   * stage via `stage.switchTo(this.onWin)`.  Does nothing if the level has
   * already been won or lost.
   */
  public winLevel() {
    if (this.decided) return;
    this.decided = true;
    if (this.winSceneBuilder) stage.requestOverlay(this.winSceneBuilder, true);
    else stage.switchTo(this.onWin);
  }

  /**
   * When a playable level is lost, we run this code to shut it down and then
   * either show an overlay (`loseSceneBuilder`) or move straight to the next
   * stage via `stage.switchTo(this.onLose)`.  Does nothing if the level has
   * already been won or lost.
   */
  public loseLevel() {
    if (this.decided) return;
    this.decided = true;
    if (this.loseSceneBuilder) stage.requestOverlay(this.loseSceneBuilder, true);
    else stage.switchTo(this.onLose);
  }
}
