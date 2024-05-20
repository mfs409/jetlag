## Varying Projectile Velocity

In our next [game](game_06.ts), we'll vary the velocity of projectiles based on
the distance between where we touch and where the hero resides:

<iframe src="./game_06.iframe.html"></iframe>

This level is reminiscent of games where you need to keep asteroids from hitting
the ground.  We start by drawing a floor, but no bounding box, turning on a
little bit of gravity, and making our hero:

```typescript
{{#include game_06.ts:29:42}}
```

Next, let's set up a timer that drops an enemy every second.  We'll also say
"you must defeat 20 enemies to win":

```typescript
{{#include game_06.ts:44}}
{{#include game_06.ts:104:114}}
```

Finally, we need to set up our pool of projectiles.  You'll quickly realize that
this code is almost the same as one of the previous examples.  There are just a
few small differences:

- Since there's gravity, we use `SetGravityScale(0)` on the projectiles, so that
  they aren't affected by gravity.
- Some of the numbers are different, like 50 milliseconds and the offset for
  `tossAt()`.
- We're using an `ImageSprite` for the appearance.
- Instead of `fixedVectorVelocity`, the projectiles have a `multiplier`, to slow
  down the velocity that we compute based on the position of the touch.

```typescript
{{#include game_06.ts:49:72}}
```

When you make a game, you'll probably want to put the creation of projectile
pools into functions, so that your main code doesn't get cluttered with all of
this complexity!

To finish this game, we'll need some code for drawing the button that lets us
toss projectiles;

```typescript
{{#include game_06.ts:74:102}}
```
