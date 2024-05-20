## Manually Advancing Animations

When we learned about `PathMovement`, one neat feature was the ability to re-use
the same path, but "advance" it for different actors, so they didn't start at
the same place.  We can do the same for animations.  Here's [the code](game_09.ts) we'll write, and here's what it looks like when we run it:

<iframe src="./game_09.iframe.html"></iframe>

The first part of this code is just like before: we make a map and set up an
animation for the `IDLE_E` state:

```typescript
{{#include game_09.ts:28:34}}
```

This time, though, we'll make a loop that draws 16 coins.  For each coin, we'll
use "skip to" to jump forward in the animation sequence.  When skipping, we can
select which frame of the animation to use, and how many milliseconds into the
frame to pretend have transpired.  In this code, we use `Math.trunc(i/2)` to
turn the loop index into a whole number for the frame, and then we use
`(i%2)*50` so that every other coin will be halfway through its 100-millisecond
animation.

```typescript
{{#include game_09.ts:37:43}}
```
