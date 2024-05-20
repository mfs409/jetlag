## Reclaiming Projectiles Based On Distance

In the previous example, we cheated by putting a border around the screen.  That
doesn't really work for side-scrolling games.  This [game](game_05.ts) uses a
different strategy.  It also shows how projectile damage and enemy damage
relate:

<iframe src="./game_05.iframe.html"></iframe>

We start this game by making a border, setting up gravity, and making a hero
who can move:

```typescript
{{#include game_05.ts:33:45}}
```

Next, we'll make some enemies that we can defeat.  Their damage amounts will
vary, so that it will take different numbers of projectiles to defeat them:

```typescript
{{#include game_05.ts:81:88}}
```

We'll use the space bar to toss projectiles, using the `tossFrom()` technique.
To make the game feel a bit more fun, we'll randomly change the projectile image
when we throw it.

```admonish Note
This only works because we'll make sure each of our projectiles has 
exactly one `AppearanceComponent`, and that each of those is an
`ImageSprite`!
```

Note that in the following code, we mention a `projectiles` pool that we haven't
made yet.  We'll get to it in just a moment.

```typescript
{{#include game_05.ts:72:79}}
```

The last step is to create our pool of projectiles.  We'll only make three, but
with no limit, we'll be able to reuse them as much as we want.

```typescript
{{#include game_05.ts:47:70}}
```

In the configuration of these projectiles, we use a new feature of the role:
`prerenderTasks`.  It is a collection of functions.  While it's possible to put
many `prerenderTasks` on each projectile, it's usually best to just have one,
because we have to run each of them for each projectile that has them.  They run
on each clock tick, *before* we update the world.  

Every time we toss a projectile, its `rangeFrom` field will hold the initial
point from which the projectile was tossed. In this code, the task is using the
Pythagorean theorem to figure out if the projectile has moved more than `range`
meters away from that point, in which case we reclaim it.  Notice that you could
use `hero.rigidBody.cx` and `hero.rigidBody.cy` if you wanted to think about the
hero's current location, instead.  That would make more sense if we were just
worried about things going off-screen.

One last note: you probably remember that the Pythagorean theorem says:

$$
c^2 = a^2 + b^2
$$

That implies that the distance formula is:

$$
c = \sqrt{a^2 + b^2}
$$

Our code doesn't bother to take the square root.  Instead, it uses the square of
the range (`range * range`).  The result is the same, but square roots are
expensive to compute.  Since we don't need it, we don't bother.
