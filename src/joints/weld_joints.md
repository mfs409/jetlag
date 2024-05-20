## Weld Joints

Another type of joint can be used to "weld" two actors' bodies together.  This
can provide a "power up" to an item, or could be a way to show that an actor
needs to "pick up" an item and carry it, as in the [example below](game_02.ts):

<iframe src="./game_02.iframe.html"></iframe>

Let's start by making a world with some gravity, a border and a hero who moves
via tilt:

```typescript
{{#include game_01.ts:24:35}}
```

The "box" will just be an obstacle.  We'll give the obstacle a `heroCollision`
that uses `setWeldJoint()` to weld the box to the hero.  This function takes 6
arguments.  The first is the actor to weld, followed by two x,y pairs,
representing the offsets from the two actors' centers.  The last argument is an
angle (in radians), in case we want some rotation between the welded actors.

```typescript
{{#include game_01.ts:37:48}}
```
