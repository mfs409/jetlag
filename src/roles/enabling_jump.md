## Enabling Jump

Another important property of Obstacles is that they serve as a "base" from
which a hero can jump.  Recall from the last chapter set that jumping is a
property of the Hero role, not of the actor's movement.  This lets us detect
obstacle/hero collisions, and use them to re-enable jumping.

<iframe src="game_11.iframe.html"></iframe>

In [this example](game_11.ts), I wanted to show that sometimes when you press
`SPACE` to make the hero jump, it doesn't work.  The `console.log()` call will
print to the developer console (remember: you can open it with `F12`) every time
the player tries to make the hero jump.  When the hero is in the air, the call
to `jump` will not do anything.

We start by setting up gravity and a hero.  Pressing the space bar will try to
make the hero jup.  Notice that this mini-game has a "side" perspective:

```typescript
{{#include game_11.ts:36:52}}
```

The floor, side walls, and ceiling all have the default behavior, which is that
any collision, from any side, will re-enable jumping by the hero.  Now let's add
a platform that only re-enables jumping when the hero collides with its top.

```typescript
{{#include game_11.ts:54:59}}
```

Before moving on, you should try to make changes to this code.  What happens if
you put `[DIRECTION.N, DIRECTION.S]`?  Can you repeatedly make the hero jump, so
that it seems to be stuck to the bottom of the platform?  Can you use the sides
to do "wall jumps" and reach the ceiling?
