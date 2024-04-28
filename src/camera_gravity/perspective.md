## Introducing Gravity... It's All About Perspective

In our previous game, it *felt* like there was some kind of gravity affecting
the hero, but we didn't really tell JetLag that we wanted gravity.  You might
want to stop for a moment to think about why.

I would argue that there was gravity, it's just that the gravity was not in the
"left/right" or "up/down" dimensions on the screen... it was in a "z" dimension,
as if going straight down from your screen to the center of the earth.  Put
another way, the *perspective* of the game was from above.  We were looking down
at the game, so we didn't expect gravity to be pushing things around on the
screen (unless the screen was tilted).

In JetLag, this corresponds to a gravity of (0, 0).  That is, there is no default force in the x or y dimension.  If we instead had gravity in the Y dimension, it would seem like we were looking at the game from a side perspective, in which case the hero would fall to the ground.

If you add this one line to the code, the whole perspective will shift:

```typescript
  stage.world.setGravity(0, 10);
```

Of course, we don't have a floor in our game, so the hero will just fall off the
screen, and keep falling forever.

If you change the "box" obstacle's `cx` to 5, the hero will have a place to
land.  Of course, as soon as you move the hero off the box, it will fall, but at
least it can stay still for a little while.
