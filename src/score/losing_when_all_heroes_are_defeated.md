## Losing When All Heroes Are Defeated

Since the roles in JetLag center around the idea of heroes, any time a hero is
defeated, JetLag will check if all heroes have been defeated, and if so, the
level will end.

<iframe src="./game_13.iframe.html"></iframe>

In this level, we won't bother with providing a way to win.  We also don't need
to tell JetLag about losing... once both heroes collide with the enemy, the
level will end.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero()
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1.5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero()
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 3.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
    });
```

In this mini-game, it's still a good idea to tell JetLag what the win condition
is, even if it's not possible:

```typescript
    stage.score.setVictoryEnemyCount();
```
