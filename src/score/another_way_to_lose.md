## Another Way To Lose

As you probably guessed, there's one more way to lose: we can decide that some
event has necessitated that the level end, and then we can call
`stage.score.loseLevel()`.  This is symmetric to `winLevel()`, which we saw up
above.

<iframe src="./game_15.iframe.html"></iframe>

For simplicity, in this mini-game, the level ends when you tap the actor.  An
example where this is useful is in trivia games, where several of the answers to
a question will tap to `loseLevel()`, and one will tap to `winLevel()`.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      gestures: { tap: () => { stage.score.loseLevel(); return true; } }
    });
```
