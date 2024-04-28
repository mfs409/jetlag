## Winning By Collecting Goodies

JetLag tracks the collection of four different types of goodies.  You can, of
course, let these "goodies" represent whatever you want... it could be coins,
like platinum, gold, silver, and copper; or gems; or pieces of a puzzle, or
whatever else.  To JetLag, these four goodie counters are just numbers.  JetLag
also lets you win by collecting a certain number of goodies:

<iframe src="./game_09.iframe.html"></iframe>

In the above game, you need to collect one of each type of goodie.  You can, of
course, require different numbers of each type of goodie, too.  To write this
mini-game, we start by creating a hero and a few goodies:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 10 })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect: () => { stage.score.addToGoodieCount(0, 1); return true; } }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 3.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect: () => { stage.score.addToGoodieCount(1, 1); return true; } }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect: () => { stage.score.addToGoodieCount(2, 1); return true; } }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 5.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect: () => { stage.score.addToGoodieCount(3, 1); return true; } }),
    });
```

Then we tell JetLag that we want to win via collecting goodies.  This also
indicates the minimum number of each goodie type that must be collected.

```typescript
    stage.score.setVictoryGoodies(1, 1, 1, 1);
```
