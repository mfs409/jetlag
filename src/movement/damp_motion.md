## Dampened Motion

One of the goals of this chapter is to use movement as a way to learn more
about rigid bodies.  We just saw `disableRotation`.  Another thing we can do is
introduce `damping` factors.  These say that an actor's rigidBody should slow
down, not stop.  We can use damping on angular rotation and/or on velocity.
Here's an example.  Watch what happens when you stop using the arrows to move
the green ball.  Also, be sure to use `a` and `s` to apply rotation to the
actor.

<iframe src="game_09.iframe.html"></iframe>

Here's the [code for the mini-game](game_09.ts).  There are a few things to notice:

- We use a background layer, even though the camera isn't moving, because that's
  an easy way to get a background on the level.
- The background (`mid.png`) has transparency, so putting a background color on
  the stage works nicely.  You could even use a timer to slowly make the
  background darker, to simulate night falling.
- Due to a weird aspect of the language we're using (TypeScript), we can't just
  say `hero.movement.setDamping(1)`.  Instead, we have to remind the language
  that `hero.movement` is a `ManualMovement`, by using the syntax
  `(hero.movement as ManualMovement)`.

But in the end, all it takes to get the effect we want is these two lines:

```typescript
{{#include game_09.ts:38:40}}
```
