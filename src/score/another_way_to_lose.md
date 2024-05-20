## Another Way To Lose

As you probably guessed, there's one more way to lose: we can decide that some
event has necessitated that the level end, and then we can call
`stage.score.loseLevel()`.  This is symmetric to `winLevel()`, which we saw up
above.

<iframe src="./game_15.iframe.html"></iframe>

For simplicity, in this [game](game_15.ts), the level ends when you tap the
actor.  An example where this is useful is in trivia games, where several of the
answers to a question will tap to `loseLevel()`, and one will tap to
`winLevel()`.

```typescript
{{#include game_15.ts:37:42}}
```
