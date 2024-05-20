## Disabling Collisions For Teams Of Actors

Another way we can change the behavior of collisions is by indicating that
certain combinations of actors simply do not collide with each other.  In this
[game](game_03.ts), the hero is able to move through the red wall, but the enemy
cannot:

<iframe src="./game_03.iframe.html"></iframe>

JetLag achieves this behavior via an extra field, called `passThroughId`.  It is
an array of numbers.  If two actors have any number in common between their two
arrays, then JetLag will turn off collisions between those two actors.

```typescript
{{#include game_03.ts:28:50}}
```

A nice aspect of this design is that you can use many different numbers to
represent many different rules.  For example, maybe enemies should pass through
obstacles, obstacles through heroes, heroes through goodies, and goodies through
destinations.  Using a different number for each rule, and two numbers per
actor, would let you express these behaviors.
