## Setting Up The Local Storage

When the size of your game gets past a certain size, you'll find that it is hard
to use the `()=>{}` syntax to effectively keep track of all of the information
that a level of your game needs.  The "level" storage feature lets you store
information so that it is "globally accessible" throughout your code.  It gets
reset each time JetLag calls `builder()`.  You can use different objects for
different levels, but in this game, we'll just have a single `LStore`.

Since we know that each time we call `builder()`, the level storage will be
empty, we can just put these two lines at the top of the builder function:

```typescript
{{#include game_01.ts:47:49}}
```

Now, throughout the `builder()`, we'll be able to use `lstore` directly.  And
any function *outside* of `builder()` can get access to the local storage like
this:

```typescript
  let lstore = stage.storage.getLevel("stage") as LStore;
```
