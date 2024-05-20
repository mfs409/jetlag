## Getting Started

This chapter uses the `enableTilt()` and `boundingBox()` functions from
[common.ts](common.ts).  You'll also want to make sure
[sprites.json](../assets/sprites.json) and [sprites.png](../assets/sprites.png)
are in your `assets` folder, and that `sprites.json` is in your `imageNames`.

It can be difficult to see that the level was actually won or lost if it
restarts immediately, so our examples will also make use of these two helper
functions from the chapter on transitioning among stages:

```typescript
{{#include score_helpers.ts:39:89}}
```

In the code that supports this chapter, these two functions are in a file called
[score_helpers.ts](score_helpers.ts).  It has another helpful function that
we'll discuss in the next section.
