## Putting Projectiles Back Into The Pool

Our last example did not work well, because we didn't have a way of putting our
projectiles back into the pool.  Our next example fixes the problem.  It also
introduces a way to limit the number of projectiles that can be thrown. It might
seem odd to have two different kinds of limits on projectiles... one limit is on
the total number that JetLag manages, the other is on the number of projectiles
that are available.  It might help to think about a quiver of arrows... in this
example, your quiver has 15 arrows, but the pool only has 10.  That means up to
10 arrows can be on the screen at once, and 5 arrows will get re-used to
ultimately have a total of 15.

<iframe src="./game_03.iframe.html"></iframe>

The `Projectile` role understands that it is the kind of thing that we like to
re-use in a pool, so it has an optional `reclaimer` function.  The purpose of
this function is to tell JetLag what to do when the projectile becomes disabled.
Remember that the default behavior is for a projectile to disable when it
collides with an obstacle.  Thus we can update the role like this:

```typescript
      role: new Projectile({ reclaimer: (actor: Actor) => projectiles.put(actor) })
```

And now we seem to have an unlimited supply of projectiles, even though there
are only 10 in the pool that are being re-used, over and over again.  Be sure to
test this behavior before moving on with this example.

Next, we'll put a limit on the total number of projectiles that can be thrown.

```typescript
    projectiles.setLimit(15);
```

Any time there's a limit in your game, you'll want to let the player know.  You
can use `projectiles.getRemaining()` to keep track of the remaining number of
shots.  You could also make power-ups that called `projectiles.setLimit()`` to
increase it again.
