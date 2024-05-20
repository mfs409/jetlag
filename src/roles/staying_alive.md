## Staying Alive

In the next mini-game, there is more than one hero.  Usually, that means the
game will go on until all heroes are defeated.  However, in this mini-game one
of the heroes is special: the level will end immediately if that one is
defeated.

<iframe src="game_16.iframe.html"></iframe>

To make the [game](game_16.ts), we'll start by making several heroes.  Their
strengths will vary, and the third one we make will be the one that must not be
defeated.

```typescript
{{#include game_16.ts:35:42}}
```

Next, we'll make an enemy.  It will have a high damage, so it can defeat most of
our heroes.  Of course, for most heroes, when they are defeated, the game won't
end.  We'll also say that when the enemy defeats a hero, it will grow.  Finally,
when the hero defeats the enemy, we'll put a goodie into the world.

```typescript
{{#include game_15.ts:44:55}}
```

Did the new `onDefeatHero` and `onDefeated` features look familiar?  If so, then
you're probably starting to get the hang of the kind of thinking and programming
that JetLag encourages.
