## The `help.ts` File

In the chooser, and also in the help, we have ways to move between "levels"
within the file.  That let us have three chooser screens, and now we'll have two
help screens.

```typescript
{{#include help.ts}}
```

There isn't really anything special about the help screens.  But it is worth
noting that all of these builders are really making playable levels.  That means
that you could have animations, interactivity, "training experiences",
interactive stores, cut scenes, and so forth, if you wanted to.
