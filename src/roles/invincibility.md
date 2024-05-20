## Invincibility

For our last mini-game of this chapter, we'll see how JetLag supports
invincibility.  In this level, the goodie (blue ball) adds 15 seconds of
invincibility to the hero.  But be careful... not all enemies can be defeated
by invincibility.  That's an important point... if you were making a game
like Super Mario Bros, you might want to put an enemy in the bottom of each
pit, to detect when the hero fell off stage.  If the hero was invincible,
you'd still want to start over on such a collision!

<iframe src="game_17.iframe.html"></iframe>

In this [game](game_17.ts), we'll say that you need to defeat three enemies to win:

```typescript
{{#include game_17.ts:37}}
```

Now we'll make a basic hero:

```typescript
{{#include game_17.ts:39:44}}
```

Next, we'll add five enemies.  We'll make them all rotate.  The last enemy won't
damage an invincible hero, but also won't be defeated when an invincible hero
collides with it.  The middle enemy will automatically defeat the hero, even
when the hero is invincible.  Also, notice that we use `disableHeroCollision`,
so that the hero passes through enemies, instead of bouncing off of them.

```typescript
{{#include game_17.ts:47:54}}
```

Next, we'll add a goodie that makes the hero invincible.  Notice that we don't
just set the `invincibleRemaining`, instead we *add* to it.  We could have just
set it to 15, but this approach would let there be several goodies, and the hero
could accrue lots of time being invincible.

```typescript
{{#include game_17.ts:57:65}}
```

Finally, we'll put some text on the screen to show how much invincibility time
is remaining.  We haven't really discussed text yet, so this code might be
confusing.  Don't worry... we'll get to it in a later chapter.  The main thing
to remember is that you need to give the player some cues about invincibility,
so they can use it well.

```typescript
{{#include game_17.ts:67:71}}
```
