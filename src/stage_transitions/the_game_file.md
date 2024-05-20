## The `game.ts` File

We're in a weird situation here... almost every file depends on some other file!
Rather than make some edits, then make more later, we'll look at one file at a
time.  The easiest is `game.ts`:

```typescript
{{#include game.ts}}
```

Hopefully, this file is familiar.  In order for it to work, you'll need this
spritesheet:

- [sprites.json](../assets/sprites.json)
- [sprites.png](../assets/sprites.png)

You'll also need the [`common.ts`](common.ts) file.

Lastly, you'll need these two sound files, which we will use as background
music:

- [tune.ogg](../assets/tune.ogg)
- [tune2.ogg](../assets/tune2.ogg)

Neither is a particularly good bit of music.  We're going to use them to show
how we can have per-level music, or have music that is consistent (and doesn't
restart) while we move among parts of the game.  Other than these new imports,
the only tricky part of the code is that `splashBuilder` is not defined in the
file, but instead is imported.  We'll get to it soon.
