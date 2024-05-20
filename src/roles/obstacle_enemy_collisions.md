## Obstacle-Enemy Collisions

In the next mini-game, we'll see two new features of Obstacles.  The first is
that we can run code when an enemy collides with an obstacle.  In the game, this
means that the obstacle will be able to "defeat" one of the enemies.

The other thing you'll see in this mini-game is that we can disable
hero-obstacle collisions, even when everything else still collides with the
obstacle.  This lets us have a wall that the hero can run through, so it can
hide from an enemy that is chasing it.

<iframe src="game_09.iframe.html"></iframe>

To make this [mini-game](game_09.ts), we start with a hero:

```typescript
{{#include game_09.ts:34:39}}
```

Next, we'll add two enemies.  Notice that I'm using `extra` to mark one as being "weak":

```typescript
{{#include game_09.ts:51:65}}
```

Finally, we'll make an obstacle.  When making the `Obstacle` role, I've added
two things.  The first is `disableHeroCollision`, which lets the hero pass
through this wall.  The second is an `enemyCollision` function, which defeats
the enemy only if it is weak.

```typescript
{{#include game_09.ts:41:49}}
```
