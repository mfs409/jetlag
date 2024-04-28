## Organizing Data In Objects

In our game, we're going to need to track three kinds of data:

- During a game, we need to know how many coins have been collected
- Between levels, we need to know how many coins have not yet been turned into
  rubies
- Between visits to the website (or times opening the app), we need to know (1)
  how many times the game has been played, (2) the date when it was last played,
  and (3) how many rubies have been minted.

We'll accomplish this by defining three different "classes".  A `class` is a way
of giving a name to a collection of information.  This will make our code much
easier to manage.

In your `game.ts` file, but *not* inside of the `builder()` function, let's
create three classes:

```typescript
/** This is for Level Storage */
class LStore {
  coins = 0; // Coins collected during a stage
};

/** This is for Session Storage */
class SStore {
  coins = 0; // Coins collected so far during this session
}

/** This is for Persistent Storage.  It shouldn't have any methods */
class PStore {
  num_times_played = 0;
  last_played = new Date().toUTCString();
  rubies = 0; // 5 coins should automatically become a ruby and get saved
}
```

JetLag's session, level, and persistent storage can keep track of many different
objects at once, by using a different bit of text to uniquely identify each
(this is different from `storageKey`).  In our game, we'll only have one object
of local storage, one object of session storage, and one object of persistent
storage.  But we'll still need a name for each.  We'll use the name "stats" for
the `LStore`, "session_state" for the `SStore`, and "persistent_info" for the
`PStore`.

There's one more catch: While the game is playing, it will be easy to make sure
there's always an `LStore` and `SStore` object on hand.  We can change them as
needed, and everything will be fine.  However, the `PStore` is a bit trickier.
The browser isn't allowed to know what a `PStore` is, so whenever we change it,
we'll need to turn the PStore into text, and then explicitly save it as the
"persistent_info".  This function will handle it:

```typescript
/** Save a PStore */
function persist(p: PStore, key: string) {
  stage.storage.setPersistent(key, JSON.stringify(p))
}
```
