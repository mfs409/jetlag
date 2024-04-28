## Getting Started With Goodies

Let's start by looking at Goodies.  Whenever a hero collides with a goodie, it
automatically collects it.  JetLag has four built-in "goodie counters".  When
you collide with a goodie, the default is that the "0" goodie counter increments
by one.

<iframe src="game_01.iframe.html"></iframe>

In the code below, it's good to keep in mind that when JetLag makes a hero, it
always makes the hero's `rigidBody` dynamic, since there are so many important
collisions that involve heroes.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
      role: new Goodie(),
    });

    // Set up a way to quickly get the goodie counts by pressing the '?' key
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SLASH, () =>
      window.alert(`${stage.score.getGoodieCount(0)}, ${stage.score.getGoodieCount(1)}, ${stage.score.getGoodieCount(2)}, ${stage.score.getGoodieCount(3)}`));
```

You'll also notice that there's a bit of code at the end that reports how many
goodies have been collected.  This, of course, is a terrible way to report
information in the middle of a game.  Since we haven't learned too much about
`Text` yet, it'll do for now.
