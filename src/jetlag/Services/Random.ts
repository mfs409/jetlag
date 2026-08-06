/**
 * Random is a seedable pseudo-random number generator.  Unlike `Math.random()`,
 * reseeding with the same number and making the same sequence of calls always
 * produces the same sequence of results, which is useful for procedural level
 * generation you want to be reproducible
 *
 * If you don't care about reproducibility, you don't need to seed it at all:
 * the constructor picks a seed from the clock, so an unseeded RandomService
 * still behaves like an ordinary random number generator.
 */
export class RandomService {
  /** The generator's internal state */
  private state: number;

  /**
   * Construct a RandomService
   *
   * @param seed  The seed to start from.  Defaults to a value derived from
   *              the clock, so that an unseeded RandomService still gives
   *              different results from run to run.
   */
  constructor(seed?: number) { this.state = (seed ?? Date.now()) >>> 0; }

  /**
   * Reset the generator to start over from `seed`. Calling `reseed(1234)`
   * and then making the same sequence of `next()`/`nextInt()`/etc. calls
   * will always produce the same sequence of results.
   *
   * @param seed The seed to restart from
   */
  public reseed(seed: number) { this.state = seed >>> 0; }

  /**
   * The next pseudo-random number, uniformly distributed in [0, 1).
   *
   * This is `mulberry32`, a small, fast PRNG that's more than good enough
   * for games (though not for cryptography).
   */
  public next() {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * A pseudo-random integer in [0, maxExclusive)
   *
   * @param maxExclusive The exclusive upper bound
   */
  public nextInt(maxExclusive: number) {
    return Math.floor(this.next() * maxExclusive);
  }

  /**
   * A pseudo-random integer in [minInclusive, maxExclusive)
   *
   * @param minInclusive The inclusive lower bound
   * @param maxExclusive The exclusive upper bound
   */
  public nextRange(minInclusive: number, maxExclusive: number) {
    return minInclusive + this.nextInt(maxExclusive - minInclusive);
  }

  /**
   * A pseudo-random boolean
   *
   * @param probability The chance of returning `true` (default 0.5)
   */
  public nextBoolean(probability = 0.5) { return this.next() < probability; }

  /**
   * A pseudo-randomly chosen element of `choices`
   *
   * @param choices A non-empty array to choose from
   */
  public choice<T>(choices: T[]) {
    return choices[this.nextInt(choices.length)];
  }
}
