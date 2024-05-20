## Getting Started With Goodies

Let's start by looking at Goodies.  Whenever a hero collides with a goodie, it
automatically collects it.  JetLag has four built-in "goodie counters".  When
you collide with a goodie, the default is that the "0" goodie counter increments
by one.

<iframe src="game_01.iframe.html"></iframe>

In the code below, it's good to keep in mind that when JetLag makes a hero, it
always makes the hero's `rigidBody` dynamic, since there are so many important
collisions that involve heroes.

```typescript
{{#include game_01.ts:38:53}}
```

You'll also notice that there's a bit of code at the end that reports how many
goodies have been collected.  This, of course, is a terrible way to report
information in the middle of a game.  Since we haven't learned too much about
`Text` yet, it'll do for now.

(Here's the [complete game](game_01.ts).)
