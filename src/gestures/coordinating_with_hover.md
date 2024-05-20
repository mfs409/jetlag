## Coordinating With Hover

Sometimes, the interaction between a gesture and a style of movement is complex,
and needs special attention.  As an example, a few years ago a student wanted to
have an actor who hovered at some spot until it was flicked.  The
`HoverMovement` didn't really work with `swipe` gestures, so I had to make some
changes to JetLag.  This [game](game_09.ts) shows how to get hovering and
swiping to work together.

<iframe src="./game_09.iframe.html"></iframe>

In the game, we start by setting up gravity and making our first hero.  This one
hovers until it is tapped.  Since `HoverMovement` is a limited movement
component, we have to put velocity directly on the body, instead of using the
(more convenient) movement component.

```typescript
{{#include game_09.ts:31:48}}
```

Our next hero will also hover, but we'll set up swipe gestures like in one of
the earlier games.

```typescript
{{#include game_09.ts:50:88}}
```

This code is almost the same as what we did before, but now we have to call
`stopHover()`, and we have to work with the rigid body directly.

The real lesson here is that JetLag tries to make things easy, but it also tries
not to hide things too aggressively.  So, in this case, when the `HoverMovement`
proved to be inadequate, the solution was to work directly with the `rigidBody`.
We also could have made a new movement component.  When you're faced with these
kinds of decisions, you'll grow to develop a style and preference that work best
for you.
