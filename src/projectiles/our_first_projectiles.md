## Our First Projectiles

In the [game](game_01.ts) below, pressing space will toss a projectile to the
right.  As you're testing this code, be sure to press and hold the space bar.
You'll notice that you can get some unexpected behavior!

<iframe src="./game_01.iframe.html"></iframe>

Most of the code for this game should be familiar.  We'll start by making a
border and a hero who can move left and right:

```typescript
{{#include game_01.ts:30:37}}

{{#include game_01.ts:51:54}}
```

We won't make an actor pool yet.  Instead, we'll say that every time the space
bar is pressed, we'll create a new projectile.  The projectile will appear 0.2
meters to the right of the hero.  Then we'll use `tossFrom()` to toss the
projectile to the right.  `tossFrom()` takes an actor, the x,y coordinates of a
position that is relative to the actor's center, and x,y values for a projectile
velocity.  That means we don't really need to care where we make the rigidBody:
our call to `tossFrom` will move it to a position that is .2 to the right of the
hero, and will make the projectile move to the right at a velocity of 5
meters/second.

```typescript
{{#include game_01.ts:38:50}}
```

One surprise you'll discover is that these projectiles have gravity, so they
start falling down.  Another is that they disappear when they collide with the
floor.  And, finally, you'll notice that they are colliding with the hero
(because we are starting them .2 to the right of the hero's center, but the
hero's radius is .4).  Every time we throw a projectile, Box2D sees that the
projectile is colliding with the hero, and it processes a collision.  This
pushes the hero left a little bit.  If you change the .2 in `tossFrom() to .4,
then this quirky behavior will go away.
