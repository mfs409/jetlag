## Preliminary Setup

The parts of this chapter each start from the same point.  You'll want to
download these files:

- [sprites.json](../assets/sprites.json)
- [sprites.png](../assets/sprites.png)
- [common.ts](./common.ts)

Then you should re-set your game to look like this:

```typescript
{{#include ../empty/game.ts}}
```

Finally, you'll want to put these lines at the top of the `builder()` function.
They make sure that whenever the level is won or lost, it automatically
restarts.

```typescript
{{#include game_01.ts:24:26}}
```

And lastly, you should set up a bounding box and tilt:

```typescript
{{#include game_01.ts:28:30}}
```
