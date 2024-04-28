## Actor Pools

An actor pool is a fixed-size container that can hold a bunch of actors.  In
JetLag, you can make as many actor pools as you want, but it's probably a good
idea for each actor pool be homogeneous: every actor in it should be the same
(same role, same movement component, etc.).

When you start a level, you can fill your actor pool with some number of actors,
and then any time you need an actor, you can ask for one from the pool.  So far,
this might sound silly: it's no different than constructing an actor (via `new
Actor()`) every time you need one.  What makes actor pools special is that you
can put things back into the pool, so you can reuse them later.

The challenge, then, is figuring out the conditions under which we should put a
projectile back into the pool.  A few examples are:

- Some amount of time ran out.  This is useful when we're using a projectile as
  the hitbox for punching or melee combat.
- The projectile collided with something.  This might be an enemy that the
  projectile damaged, or it might be an obstacle.
- The projectile is too far from some point (such as the hero who tossed it, or
  the location from which it was thrown).

One more nice thing about actor pools is that they have a capacity.  So, for
example, if your hero can toss an unlimited number of projectiles, but you only
want three on the screen at any time, initializing your actor pool with three
projectiles will do the job.

You might also want to have multiple actor pools (for example, one for arrows,
one for magic, one for punching).  You'll find that as your game gets more
complex, actor pools make it easy to organize your code, and also to separate it
into files.
