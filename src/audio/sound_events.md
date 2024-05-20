## Sound Events

To use sound effects, we just add a sound component to an actor.  There are six
sound events.  Note that some of them only make sense for certain kinds of
roles:

- Disappear: We assign this to any role, so it will make a sound when it
  disappears.
- Toss: We assign this to a projectile, so it will make a sound when it is
  tossed.
- Arrive: We assign this to a destination, so it will make a sound when a hero
  arrives at it.
- Defeat: We assign this to an enemy, so it will make a sound when it is
  defeated.
- Jump: We assign this to a hero, so it will make a sound when it jumps.
- Collide: We assign this to an obstacle, so it will make a sound when a hero
  collides with it.

Here's a [game](game_15.ts) that shows all of the behaviors:

<iframe src="./game_15.iframe.html"></iframe>

The remarkable thing about this mini-game is that the hardest part is not
configuring the sounds, but creating the kinds of actors who can have the sorts
of interactions that will lead to the sound effects happening:

```typescript
{{#include game_15.ts:29:89}}
```
