import { stage } from "../Stage";

/**
 * StorageDevice provides three key/value stores
 *
 * - Persistent: Things saved using the HTML5 persistent storage API.  You
 *               should try to only save serialized JSON here.  Ideally, you'll
 *               load it at game start into the Session, and then flush the
 *               whole thing back when there is something worth saving.
 * - Session:    Things that last as the player moves among levels, but are
 *               discarded when the player exits/refreshes the browser.
 * - Level:      Things that last only until the player moves to another level.
 */
export class StorageDevice {
  /**
   * Construct the storage device
   *
   * @param prefix A string to put in front of every persistent key, so that
   *               games hosted at the same web address can't overwrite each
   *               other's saved data.
   */
  constructor(private readonly prefix: string) { }

  /**
   * The session store: the value of every `SessionValue`, keyed by the
   * `SessionValue`
   */
  private readonly sessionFacts = new Map<SessionValue<any>, unknown>();

  /**
   * The level store: the value of every `LevelValue`, keyed by the `LevelValue`
   */
  private readonly levelFacts = new Map<LevelValue<any>, unknown>();

  /**
   * Look up a `SessionValue`'s value.  `SessionValue.get()` calls this; user
   * code shouldn't need to. The first time, the value is made with `initial`.
   *
   * @param key     The `SessionValue`
   * @param initial The function that makes the value
   */
  public getSession<T>(key: SessionValue<T>, initial: () => T): T {
    if (!this.sessionFacts.has(key)) this.sessionFacts.set(key, initial());
    return this.sessionFacts.get(key) as T;
  }

  /** Replace a `SessionValue`'s value.  `SessionValue.set()` calls this. */
  public setSession<T>(key: SessionValue<T>, value: T) { this.sessionFacts.set(key, value); }

  /** Forget a `SessionValue`'s value.  `SessionValue.clear()` calls this. */
  public clearSession(key: SessionValue<any>) { this.sessionFacts.delete(key); }

  /**
   * Look up a `LevelValue`'s value, making it with `initial` the first time.
   */
  public getLevel<T>(key: LevelValue<T>, initial: () => T): T {
    if (!this.levelFacts.has(key)) this.levelFacts.set(key, initial());
    return this.levelFacts.get(key) as T;
  }

  /** Replace a `LevelValue`'s value.  `LevelValue.set()` calls this. */
  public setLevel<T>(key: LevelValue<T>, value: T) { this.levelFacts.set(key, value); }

  /** Forget every `LevelValue`, i.e., on a level change */
  public clearLevelStorage() { this.levelFacts.clear(); }

  /**
   * Load saved data from persistent storage.  Persistent storage can only hold
   * plain data: numbers, strings, booleans, arrays, and plain objects made of
   * those.
   *
   * The recommended way to use it is to load once, at the start of the game,
   * into a `SessionValue`, and then work with the session value:
   *
   *     class Progress { best = 0; unlocked = 1; }
   *     const PROGRESS = new SessionValue("progress", () => stage.storage.loadPersistent("progress", new Progress()));
   *
   * `defaults` is used when nothing has been saved.  When something has been
   * saved, each field that `defaults` has is replaced by the saved value, but
   * only if the saved value is the same kind of thing (a number for a number,
   * and so on).  Anything else that was saved is ignored.  That means that old
   * or damaged saves can't put the wrong kind of thing in your fields, and a
   * field that you add in a later version simply gets its default.
   *
   * @param key       The name that the data was saved under
   * @param defaults  An object with every field that you want, set to what it
   *                  should be if nothing was saved
   *
   * @returns `defaults`, with the saved values filled in
   */
  public loadPersistent<T extends object>(key: string, defaults: T): T {
    const text = localStorage.getItem(this.prefix + key);
    if (text == null) return defaults;
    let saved: unknown;
    try { saved = JSON.parse(text); } catch { return defaults; }
    return fillFromSaved(defaults, saved) as T;
  }

  /**
   * Save plain data to persistent storage, to be there the next time the game
   * is played.
   *
   * It only saves plain data.  If the data holds a function, a `Map`, a `Set`,
   * or anything else that can't be saved, this throws.
   *
   * @param key  The name to save the data under
   * @param data The object to save
   */
  public savePersistent(key: string, data: object) {
    checkSavable(data, key);
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }
}

/**
 * A key/value pair in the session storage that holds a value of type `T`.
 *
 * Make one as a constant, and use it wherever the value is needed:
 *
 *     const RUN = new SessionValue("run", () => new Run());
 *     RUN.get().lives -= 1;
 *
 * For an object (or an array), `get()` gives back the stored object itself,
 * so changing it changes what is stored.  For a number, a string or a
 * boolean, change it with `set`.
 */
export class SessionValue<T> {
  /**
   * Make a pair in session storage
   *
   * @param name    What this value is called, for your own reference
   * @param initial A function that makes the value, the first time it is read
   */
  constructor(readonly name: string, private readonly initial: () => T) { }

  /** The value.  The first time that it is read, it is made with the `initial` function. */
  public get(): T { return stage.storage.getSession(this, this.initial); }

  /**
   * Replace the value
   *
   * @param value The new value
   */
  public set(value: T) { stage.storage.setSession(this, value); }

  /** Forget the value, so that the next read makes a fresh one */
  public clear() { stage.storage.clearSession(this); }
}

/**
 * A key/value pair in the level storage that holds a value of type `T`
 */
export class LevelValue<T> {
  /**
   * Make a pair in level storage
   *
   * @param name    What this value is called, for your own reference
   * @param initial A function that makes the value, the first time it is read
   */
  constructor(readonly name: string, private readonly initial: () => T) { }

  /**
   * The value.  The first time that it is read during a level, it is made with
   * the `initial` function.
   */
  public get(): T { return stage.storage.getLevel(this, this.initial); }

  /**
   * Replace the value for the rest of the current level
   *
   * @param value The new value
   */
  public set(value: T) { stage.storage.setLevel(this, value); }
}

/**
 * Fill an object that has defaults with saved data, field by field, keeping only
 * saved values that are the same kind of thing as the default
 *
 * @param defaults What each field should be if nothing usable was saved
 * @param saved    What was read back from storage (anything at all)
 */
function fillFromSaved(defaults: any, saved: unknown) {
  if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : defaults;
  if (defaults !== null && typeof defaults == "object") {
    if (saved === null || typeof saved != "object" || Array.isArray(saved)) return defaults;
    const fields = saved as { [name: string]: unknown };
    for (const name of Object.keys(defaults)) {
      if (name in fields) defaults[name] = fillFromSaved(defaults[name], fields[name]);
    }
    return defaults;
  }
  return typeof saved == typeof defaults ? saved : defaults;
}

/**
 * Throw an error if something can't be saved: a function, a symbol, a `Map`, a
 * `Set`, and so on.  Plain data (numbers, strings, booleans, arrays, and
 * objects of those) is fine.
 *
 * @param value The thing to check
 * @param where Where it is, for the error message
 */
function checkSavable(value: unknown, where: string) {
  const type = typeof value;
  if (type == "function" || type == "symbol" || type == "bigint") {
    throw new Error(`Can't save "${where}": it is a ${type}, and only plain data (numbers, strings, booleans, arrays, and objects of those) can be saved`);
  }
  if (value === null || type != "object") return;
  if (value instanceof Map || value instanceof Set || value instanceof Promise) {
    throw new Error(`Can't save "${where}": it is a ${value.constructor.name}, and only plain data can be saved`);
  }
  const record = value as { [name: string]: unknown };
  for (const name of Object.keys(record)) checkSavable(record[name], `${where}.${name}`);
}
