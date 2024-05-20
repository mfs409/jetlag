## Our First State Machine

We're now ready to try to make an actor whose animation changes based on their
state.  In this case, we'll just try to get the actor to use the correct IDLE
animation when facing N/S/E/W, and the correct WALK animation when walking
N/S/E/W ([code](game_11.ts)):

<iframe src="./game_11.iframe.html"></iframe>

As you're working, remember that the two most common kinds of 2D games are those
with an overhead view, and those with a side view.  In overhead mode, it makes
sense to have animations for 8 different directions: N, NE, E, SE, S, SW, W, and
NW. But sometimes just 4 is good enough.

You'll notice right away that it's a bit glitchy: if you walk in a diagonal, the
behavior is not right.  Don't worry about that yet.  First, let's just get our
eight animations working.  The animation sequences for walking are all similar:

```typescript
{{#include game_11.ts:31:47}}
```

Likewise, the sequences for standing idle are all familiar to what we've seen so
far:

```typescript
{{#include game_11.ts:49:52}}
```

With the hard work done, we can make a hero, use these animations for its
`AnimatedSprite`, and connect the keyboard to the hero's movement:

```typescript
{{#include game_11.ts:29}}
{{#include game_11.ts:54:69}}
```
