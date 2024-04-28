## Winning And Losing Via Timers

In the following game, there is a timer, and the level wins after 5 seconds:

<iframe src="./game_01.iframe.html"></iframe>

The code for this level is just one line:

```typescript
    // Automatically win in 5 seconds
    stage.score.setVictorySurvive(5);
```

If we instead want to lose after 5 seconds, we can do it like this:

<iframe src="./game_02.iframe.html"></iframe>

```typescript
    // Automatically lose in 5 seconds
    stage.score.setLoseCountdownRemaining(5);
```
