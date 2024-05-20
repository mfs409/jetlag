## A Simple Revolute Joint

Our [first example](game_01.ts) will create a "revolute" joint.  As you probably
guessed, this joint lets one actor revolve (not rotate!) around another actor.

<iframe src="./game_01.iframe.html"></iframe>

In the code, you'll see two actors, one of which is being called `anchor`.  This
is an essential concept: the anchor defines the pivot point around which the
other actor will revolve.

```typescript
{{#include game_01.ts:23:35}}
```

Next, we connect the two actors by creating a joint between their rigid bodies.
The joint takes two x,y pairs.  These are offsets: we add the first to the
anchor's center, and the second to the revolving actor's center.  The joint will
actually be between those points.  Then we set limits (in radians) on the joint,
so that it can only move so far in either direction, and we attach a motor.  In
this case, the motor runs at half a radian per second, with infinite torque.

```typescript
{{#include game_01.ts:37:40}}
```

Code like that could serve as a flipper in a pinball-style game, if we didn't
attach a motor until some event happened.  But we'd need a way to re-set the
flipper later.  Let's add a timer, so that after 5 seconds, we can change the
motor properties and move in the opposite direction:

```typescript
{{#include game_01.ts:42:47}}
```
