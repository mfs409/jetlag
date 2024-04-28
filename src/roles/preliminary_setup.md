## Preliminary Setup

You should start by doing the "Preliminary Setup" section of the "Rigid Bodies"
tutorial.  This will ensure you have the assets you need, and that the code is
in a good starting place (e.g., the `builder()` function should be empty).

After you've done that, you should put these lines at the top of the `builder()`
function.  In each of the mini-games, we'll want this common configuration:

```typescript
  // Throughout this tutorial, we'll have levels that can be "won" or "lost".
  // In all cases, we'll go right back to the same level.
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Every level will use tilt, and every level will have a box around it
  enableTilt(10, 10);
  boundingBox();
```
