## Re-mapping Animations

In the previous example, things looked quite odd when we tried to make the hero walk in a diagonal line... in every case, it defaulted to `IDLE_E`.  Worse, when the hero stopped moving, sometimes it bounced out of `IDLE_E`.

One solution would be to add eight more animations (IDLE_NE, IDLE_NW, IDLE_SE
IDLE_SW, WALK_NE, WALK_NW, WALK_SE, and WALK_SW).  But that would bring a new
problem: when the hero switched from walking west to walking northwest, its
animation would reset.  In the following [code](game_12.ts), see if you can detect the subtle
visual glitch:

<iframe src="./game_12.iframe.html"></iframe>

JetLag lets us "re-map" animations.  This gives us a way of saying "when the
state moves to Y, use the animation from state X, and if it was in X, don't
restart the animation".  In this [game](game_13.ts), you should not see the
glitch anymore:

<iframe src="./game_13.iframe.html"></iframe>

The way we get this behavior is by making another map, the "remap", and
including it in the line for making the `AnimatedSprite`.  For starters, you'll
want to add these lines of code:

```typescript
{{#include game_13.ts:52:61}}
```

Then you can add `remap` when making a `new AnimatedSprite`:

```typescript
{{#include game_13.ts:63:68}}
```
