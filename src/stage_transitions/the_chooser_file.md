## The `chooser.ts` File

Next, let's look at the level chooser.  In this code, we use a helper function
(which we do not export) to make it easier to draw the buttons for switching to
levels of the game.  The other interesting thing here is that we *pause* the
game-wide music, and we install some music that is specific to the chooser.
You'll notice that this music re-starts when we switch choosers... that's what
`levelMusic` is supposed to do.  Otherwise, we could have used `gameMusic`.

```typescript
{{#include chooser.ts}}
```
