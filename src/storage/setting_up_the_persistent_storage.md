## Setting Up The Persistent Storage

Now we'll set up the persistent storage.  We only want to set it up if we don't
have one already. Note that for our "first time playing" rules, we need this to
be a bit more complex than session storage.

```typescript
    let first_time = false; // Is this the very first time?
    if (stage.storage.getPersistent("persistent_info") == undefined) {
      first_time = true;
      persist(new PStore(), "persistent_info"); // explicitly save it back
    }
    let pstore = JSON.parse(stage.storage.getPersistent("persistent_info")!) as PStore;
```

As with the other storage types, you can get a local variable for accessing the
persistent information at any time, like this:

```typescript
    let pstore = JSON.parse(stage.storage.getPersistent("persistent_info")!) as PStore;
```

However, don't forget that if you make changes to `pstore`, you will need to
call `persist(pstore, "persistent_info");`, or else your changes won't be saved
for the next time the game is played.

@@red WARNING@@ This kind of persistent storage is only intended for small
amounts of data (up to 5MB).  For larger amounts of storage, you'll want to have
a different strategy:

- If you are planning to launch your game as a web app that is played in a
  browser, and there is a log-in feature, then cloud storage (such as FireBase)
  may be appropriate. If your game doesn't have a log-in feature, you might
  consider
  [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB).
- If you are using Capacitor.js to create a mobile game, or Electron.js to
  create a desktop game, your options include SQLite and filesystem-based
  storage.
