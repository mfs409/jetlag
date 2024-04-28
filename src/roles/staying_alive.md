## Staying Alive

In the next mini-game, there is more than one hero.  Usually, that means the
game will go on until all heroes are defeated.  However, in this mini-game one
of the heroes is special: the level will end immediately if that one is
defeated.

<iframe src="game_16.iframe.html"></iframe>

To make the level, we'll start by making several heroes.  Their strengths will
vary, and the third one we make will be the one that must not be defeated.

```typescript
    for (let i = 1; i < 4; ++i) {
      new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
        rigidBody: new BoxBody({ cx: 2 * i, cy: 3, width: 0.8, height: 0.8 }, { density: 2 }),
        movement: new TiltMovement(),
        role: new Hero({ strength: 10 - i, mustSurvive: i == 3 }),
      });
    }
```

Next, we'll make an enemy.  It will have a high damage, so it can defeat most of
our heroes.  Of course, for most heroes, when they are defeated, the game won't
end.  We'll also say that when the enemy defeats a hero, it will grow.  Finally,
when the hero defeats the enemy, we'll put a goodie into the world.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 8.6, radius: 0.4 }),
      role: new Enemy({
        damage: 8, onDefeatHero: (e: Actor) => e.resize(1.2), onDefeated: (e: Actor) =>
          new Actor({
            appearance: new ImageSprite({ width: .5, height: .5, img: "blue_ball.png" }),
            rigidBody: new CircleBody({ radius: .25, cx: e.rigidBody.getCenter().x, cy: 2 }),
            role: new Goodie()
          })
      }),
    });
```

Did you the new `onDefeatHero` and `onDefeated` features look familiar?  If so,
then you're probably starting to get the hang of the kind of thinking and
programming that JetLag encourages.
