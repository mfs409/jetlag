## Getting Started

This tutorial uses the `boundingBox()` and `enableTilt()` functions, as well as
the `sprites.json` and `sprites.png` files.  Be sure to copy them over from
previous tutorials before continuing.

Also, since the examples are likely to involve winning and losing, you'll
probably want these three lines at the top of `builder()`:

```typescript
  boundingBox();
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
```
