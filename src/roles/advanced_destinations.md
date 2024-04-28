## Advanced Destinations

Sometimes you might want to require several heroes to reach a single
destination, or to have several destinations, each of which can only hold a few
heroes.  We'll see how to achieve these kinds of behaviors through a few quick
examples.  First, here's a destination that can hold two heroes.

<iframe src="game_04.iframe.html"></iframe>

For the most part, the code for this level is straightforward... we create two
heroes (we'll control them via Tilt) and we make a destination with a `capacity`
of 2.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 5, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
      role: new Destination({ capacity: 2 }),
    });
```

There is one small issue, though.  When one hero reaches the destination, the
level is won, and it restarts.  We need to tell JetLag that it takes *two*
heroes to win the level:

```typescript
    stage.score.setVictoryDestination(2);
```

Next, let's see what happens if we don't change the `capacity`, but we do create
multiple destinations:

<iframe src="game_05.iframe.html"></iframe>

In the above mini-game, you can see that by default, destinations do not collide
with heroes.  When a hero reaches a destination that is "full", it just passes
through it.  Remember: you can use `z` in an appearance to control whether the
hero goes under or over the destination.  The code for this use of destinations
appears below:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 5, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
      role: new Destination(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 6, radius: 0.4 }),
      role: new Destination(),
    });

    stage.score.setVictoryDestination(2);
```
