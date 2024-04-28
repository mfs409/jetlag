## Winning By Reaching A Destination

The destination role provides another way of winning a game.  We discussed this
already in the "Roles" tutorials, but it's worth reviewing here.  In the
following level, we have a single destination that can hold two heroes, and to
win, they both must reach the destination:

<iframe src="./game_10.iframe.html"></iframe>

To create this mini-game, we just need two heroes and a destination.  When we
make the destination, we give it a capacity of 2, since the default is 1.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 10 })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1.5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 10 })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Destination({ capacity: 2 })
    });
```

Then we tell JetLag that the level should end (in victory!) when two heroes
reach the destination.

```typescript
    stage.score.setVictoryDestination(2);
```

Similarly, we can have several destinations, and then we can play around with
how much capacity each has.  In this example, there are two destinations, each
of which can hold one hero:

<iframe src="./game_11.iframe.html"></iframe>

You should try to implement this level on your own, before reading my code:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 10 })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1.5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 10 })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 3.5, cy: 8.5, radius: .5 }),
      role: new Destination({ capacity: 1 })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Destination({ capacity: 1 })
    });
    stage.score.setVictoryDestination(2);
```
