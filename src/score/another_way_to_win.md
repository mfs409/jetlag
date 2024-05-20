## Another Way To Win

Sometimes it's hard to express what condition should make the player win the
level.  If all else fails, you can call `stage.score.winLevel()`, and the level
will immediately be won.

<iframe src="./game_12.iframe.html"></iframe>

In the [code](game_12.ts) below, tapping the actor leads to the level being won.
You could do much more sophisticated things... for example, if you had a puzzle,
you might check if a few actors were in certain positions.  Or perhaps you are
thinking of a game like "Simon", where the level wins if the player produces a
specific sequence of taps on certain actors.  The hard part of games like that
is figuring out when to win.  Then you just need to call
`stage.score.winLevel()` to end the level in victory:

```typescript
{{#include game_12.ts:37:42}}
```
