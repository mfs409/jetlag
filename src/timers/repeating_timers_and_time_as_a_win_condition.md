## Repeating Timers And Time As A Win Condition

In this next [game](game_02.ts), we'll set up a timer that makes enemies reproduce.
We'll also say that if the player stays alive for 5 seconds, they win.

<iframe src="./game_02.iframe.html"></iframe>

We'll begin by setting up a world with an overhead view:

```typescript
{{#include game_02.ts:27:29}}
```

Now let's define how the level is won.  By using `setVictorySurvive()`, we can
indicate that after 10 seconds, the level is won.  We'll also put some text on
the *HUD* to show how much time is left.  Notice that `toFixed(2)` will trim our
timer down to 2 decimal places.  (The `!` after `getWinCountdownRemaining()` is
our way of telling TypeScript "don't worry, this will really be a number"... you
can ignore it).

```typescript
{{#include game_02.ts:89:94}}
{{#include game_02.ts:103:106}}
```

Next, we'll make a hero and a goodie.  If the hero collects the goodie, we will
subtract two seconds from the timer, making it easier to win.

```typescript
{{#include game_02.ts:31:36}}

{{#include game_02.ts:97:101}}
```

Finally, we'll make a timer that runs every 2 seconds.  The tricky thing about
this timer is that we want it to "reproduce" every enemy on the screen.  That
means we need to keep track of all of the enemies.

We can use an "array" to store the enemies we've made so far.  So our first step
will be to make an enemy, make an array, and put the enemy into the array. We'll
attach some "extra" information to the enemy, so that we can track how many
times we've duplicated an enemy... if we don't, we'll risk making thousands of
enemies (if we double every 2 seconds, after 20 seconds we've made more than 1000
enemies!).

```typescript
{{#include game_02.ts:38:49}}
```

Now comes the hard part.  The problem is that we're supposed to go through the
array, and for each thing in the array, we need to make another enemy.  But we
need to put those new enemies into the array too.  If we're not careful, we'll
end up putting new things into the array and immediately duplicating them, which
will put new things into the array, which we'll immediately duplicate... that
sounds like it's never going to stop!

Instead, we'll put all the new enemies into a new array, and after we're done
with all the duplications, we'll add the new array into the `enemies` array.

```typescript
{{#include game_02.ts:57:87}}
```

This game shows an important point: the timer itself is not difficult.  The hard
thing is making sure that the code we give to our timer does what we want it to
do.
