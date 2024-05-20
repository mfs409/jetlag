## Enemies

In JetLag, the default is that enemies have a `damage` of 2, and heroes have a `strength` of 1.  When a hero and enemy collide, we remove the enemy and subtract its damage from the hero's strength if we can do so without the hero strength becoming 0 or negative.  Otherwise, we remove the hero.

In this level, we use a goodie to increase the hero strength.  To help realize
that the hero strength has changed, we also add an `onStrengthChange` to the
hero, which changes its size.

<iframe src="game_12.iframe.html"></iframe>

Here's the [code](game_12.ts) for the above mini-game.  You should use this as
an opportunity to check your understanding... if you copy this code into your
`builder()`, and then hover over things that don't make sense, are you able to
understand why this code delivers the behaviors you're seeing in the above game?

```typescript
{{#include game_12.ts:34:62}}
```
