## Common Code

In every one of our mini-games for this tutorial, we'll want to print some
information on the screen so that we can see the scores.  We'll also want to set
up the win and lose scenes, and tell JetLag what to do when the level is won or
lost.  The following code handles *everything* that might be useful.  For any
one level, it might be more than we'll need, but it's easiest to just write it
all once:

```typescript
  // first, set up winning and losing to both restart the level
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
  winMessage("Yay");
  loseMessage("Try Again");

  // Next, put all the info on the screen
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Arrivals: " + stage.score.getDestinationArrivals()),
    rigidBody: new CircleBody({ cx: .1, cy: .1, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Defeated: " + stage.score.getEnemiesDefeated() + " / " + stage.score.getEnemiesCreated()),
    rigidBody: new CircleBody({ cx: .1, cy: .4, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Goodies: " + stage.score.getGoodieCount(0) + ", " + stage.score.getGoodieCount(1) + ", " + stage.score.getGoodieCount(2) + ", " + stage.score.getGoodieCount(3)),
    rigidBody: new CircleBody({ cx: .1, cy: .7, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Heroes: " + stage.score.getHeroesDefeated() + " / " + stage.score.getHeroesCreated()),
    rigidBody: new CircleBody({ cx: .1, cy: 1, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Stopwatch: " + stage.score.getStopwatch().toFixed(2)),
    rigidBody: new CircleBody({ cx: .1, cy: 1.3, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "FPS: " + stage.renderer.getFPS().toFixed(2)),
    rigidBody: new CircleBody({ cx: .1, cy: 1.6, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => stage.score.getWinCountdownRemaining() ? "Time Until Win: " + stage.score.getWinCountdownRemaining()?.toFixed(2) : ""),
    rigidBody: new CircleBody({ cx: .1, cy: 1.9, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => stage.score.getLoseCountdownRemaining() ? "Time Until Lose: " + stage.score.getLoseCountdownRemaining()?.toFixed(2) : ""),
    rigidBody: new CircleBody({ cx: .1, cy: 1.9, radius: .01 }, { scene: stage.hud })
  });

  // Set up tilt and put a box on the screen
  enableTilt(10, 10);
  boundingBox();
```

In the above code, you'll notice some lines that use the question mark in
unusual ways.  For example, there's a line that says:

```typescript
stage.score.getLoseCountdownRemaining() ? "Time Until Lose: " + stage.score.getLoseCountdownRemaining()?.toFixed(2) : ""
```

The syntax `condition ? value1 : value2` is a special version of an `if`
statement.  You can interpret this as saying "if the condition is not "false",
use value1.  Otherwise use value2.  So, in the specific example,
`getLoseCountdownRemaining()` could return `undefined` (i.e., because there is
no lose countdown in the level).  In that case, value2 (`""`) will be displayed.
Otherwise, we'll get the value and turn it into a number with two decimal
places.
