## Enemies

In JetLag, the default is that enemies have a `damage` of 2, and heroes have a `strength` of 1.  When a hero and enemy collide, we remove the enemy and subtract its damage from the hero's strength if we can do so without the hero strength becoming 0 or negative.  Otherwise, we remove the hero.

In this level, we use a goodie to increase the hero strength.  To help realize
that the hero strength has changed, we also add an `onStrengthChange` to the
hero, which changes its size.

<iframe src="game_12.iframe.html"></iframe>

Here's the code for the above mini-game.  You should use this as an opportunity
to check your understanding... if you copy this code into your `builder()`, and
then hover over things that don't make sense, are you able to understand why
this code delivers the behaviors you're seeing in the above game?

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.4, height: 0.4, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.2 }, { density: 2 }),
      movement: new TiltMovement(),
      role: new Hero({
        onStrengthChange: (h) => {
          if ((h.role as Hero).strength == 4) h.resize(2); else h.resize(.5);
        }
      }),
    });

    // The enemy either defeats the hero or decreases its strength.  If it just
    // decreases the strength, we'll see the hero strength change code run.
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
      role: new Enemy(),
    });

    // This goodie changes the hero's strength, which, in turn, triggers the
    // hero's strength change code
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 8, radius: 0.4 }),
      role: new Goodie({
        onCollect: (_g: Actor, h: Actor) => {
          (h.role as Hero).strength += 3;
          return true;
        }
      }),
    });
```
