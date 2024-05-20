## Getting Started

For this chapter, you'll need this file, which provides some helpful functions:

- [common.ts](./common.ts)

You'll also want to put these in your assets folder:

- [noise.png](../assets/noise.png)
- [sprites.json](../assets/sprites.json)
- [sprites.png](../assets/sprites.png)

In addition, the games we make in this chapter will involve winning and losing.  The full code listings always make use of these lines, so that on any win or lose event, the level immediately restarts:

```typescript
{{#include game_01.ts:26:27}}
```
