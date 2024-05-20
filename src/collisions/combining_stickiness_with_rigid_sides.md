## Combining Stickiness With Rigid Sides

In this next [game](game_04.ts), we do a quick test to make sure that the ideas
we've seen so far *compose*.  It should be possible to jump through the bottom
of the leftmost platform, and then stick to its top:

<iframe src="./game_04.iframe.html"></iframe>

Compared to before, the only difference from before is when we make the rigid
body for the platform on the left:

```typescript
{{#include game_04.ts:48}}
```

You'll notice that the behavior is a little bit glitchy.  There are a few ways
to fix this... you should take a few minutes to see what you can figure out.
