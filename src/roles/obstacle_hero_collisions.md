## Obstacle-Hero Collisions

Similarly, we can run code when a hero collides with an obstacle:

<iframe src="game_10.iframe.html"></iframe>

[The code for this level](game_10.ts) doesn't have many surprises.  The only
tricky thing is that we use `extra` to track if the hero has already been
resized.  That lets us avoid re-shrinking the hero every time it collides with
the obstacle.

```typescript
{{#include game_10.ts:33:52}}
```
