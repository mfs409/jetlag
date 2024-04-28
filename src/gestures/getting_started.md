## Getting Started

For this tutorial, you'll want top copy the `wideBoundingBox()` function from
the tutorial on graphical assets.  You'll also need the regular `boundingBox()`
function, the `sprites.json` spritesheet, and `noise.png`.  You should be able
to find these files and configure them based on what you learned in previous
tutorials.

In addition, the mini-games we make in this tutorial will involve winning and
losing, so you'll probably want to put these lines at the top of `builder()`, so
that they can be used by each mini-game:

```typescript
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
```
