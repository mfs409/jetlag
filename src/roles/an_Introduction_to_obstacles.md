## An Introduction to Obstacles

We've already seen Obstacles, but just to recap, the default behavior for an
Obstacle is to act like a wall:

<iframe src="game_08.iframe.html"></iframe>

It doesn't take much code to create that [level](game_08.ts): we just have a
hero and an obstacle.  One thing to notice is that the default behavior of an
obstacle is that it is static, and its collisions are enabled, so the hero will
collide with it.

```typescript
{{#include game_08.ts:34:45}}
```
