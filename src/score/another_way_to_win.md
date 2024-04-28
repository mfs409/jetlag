## Another Way To Win

Sometimes it's hard to express what condition should make the player win the
level.  If all else fails, you can call `stage.score.winLevel()`, and the level
will immediately be won.

<iframe src="./game_12.iframe.html"></iframe>

In the code below, tapping the actor leads to the level being won.  You could do
much more sophisticated things... for example, if you had a puzzle, you might
check if a few actors were in certain positions.  Or perhaps you are thinking of
a game like "Simon", where the level wins if the player produces a specific
sequence of taps on certain actors.  The hard part of games like that is
figuring out when to win.  Then you just need one line to end the level in
victory:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      gestures: { tap: () => { stage.score.winLevel(); return true; } }
    });
```
