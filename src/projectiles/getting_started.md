## Getting Started

This tutorial requires the `sprites.json` and `sprites.png` files, as well as
the `boundingBox()` function.  Since some of the examples involve winning and
losing, you'll probably want to put these two lines at the top of your
`builder()` function:

```typescript
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
```
