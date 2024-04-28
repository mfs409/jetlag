## Keeping An Eye On Special Heroes

Sometimes there is one hero that is more important than the rest.  We can mark
that hero, so that the level ends in defeat as soon as that hero is defeated:

<iframe src="./game_14.iframe.html"></iframe>

In the code for this level, the rightmost hero must survive.  If you manage to
get the other hero to collide with the enemy first, the game won't end... but as
soon as the `mustSurvive` hero collides with the enemy, the level ends.

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
      role: new Hero({ mustSurvive: true })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 3.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
    });
    stage.score.setVictoryEnemyCount();
```
