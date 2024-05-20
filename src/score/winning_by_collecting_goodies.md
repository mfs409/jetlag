## Winning By Collecting Goodies

JetLag tracks the collection of four different types of goodies.  You can, of
course, let these "goodies" represent whatever you want... it could be coins,
like platinum, gold, silver, and copper; or gems; or pieces of a puzzle, or
whatever else.  To JetLag, these four goodie counters are just numbers.  JetLag
also lets you win by collecting a certain number of goodies:

<iframe src="./game_09.iframe.html"></iframe>

In the above game, you need to collect one of each type of goodie.  You can, of
course, require different numbers of each type of goodie, too.  To write this
[game](game_09.ts), we start by creating a hero and a few goodies:

```typescript
{{#include game_09.ts:38:64}}
```

Then we tell JetLag that we want to win via collecting goodies.  This also
indicates the minimum number of each goodie type that must be collected.

```typescript
{{#include game_09.ts:65}}
```
