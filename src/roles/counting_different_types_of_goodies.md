## Counting Different Types Of Goodies

Whenever a hero collides with a goodie, some code will run.  The default is that
the code will increment the "0" goodie counter and return `true`.  If the code
returns `true`, JetLag will remove the goodie from the world.  In this
[mini-game](game_02.ts), we'll let one goodie update all four of the goodie
counters (they are "0", "1", "2", and "3").  Again, pressing the '?' key will
pop up the current goodie counts:

<iframe src="game_02.iframe.html"></iframe>

We'll start by making a Hero.  Remember that only Heroes can collect goodies.

```typescript
{{#include game_02.ts:33:38}}
```

Next, we'll make a goodie that sets each of the four counters to 1.  It also
returns `true`, which means that the goodie will disappear.  We'll also set up
the '?' key so that pressing it will tell us how many goodies have been
collected.

```typescript
{{#include game_02.ts:40:53}}
{{#include game_02.ts:83:85}}
```

Sometimes we want to add to a goodie count, or subtract from it.  To do that, we
can't just `setGoodieCount`.  Instead, we first need to `getGoodieCount()`, then
add to (or subtract from) it, and then `setGoodieCount()` with the new number.
We'll add a second goodie for that purpose.

We'll also make it so that this goodie must be collected *second*.  The way
we'll achieve that is by saying that if the 0th goodie counter is still 0, then
we'll return `false` and not update any goodie counts.  We'll also provide a
visual cue that the goodie wasn't collected, by expanding the goodie's size and
shrinking the hero.

```typescript
{{#include game_02.ts:55:81}}
```

Notice that we added an extra variable, called `resize`.  Our `onCollect` code
was able to look at it in order to decide if it should resize the hero and
goodie or not.  Also, notice how this meant that we needed to provide `g` and `h` as arguments to the `onCollect` method.  In TypeScript, we could omit them when we didn't need them, even though they were secretly there!
