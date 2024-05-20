## Losing Via Timers

We can also use timers to lose a level.  This makes the most sense when there's
another way to win.  In essence, we're saying "if you don't finish in time, you
lose".  Here's [the code](game_03.ts), and here's what it looks like when it runs:

<iframe src="./game_03.iframe.html"></iframe>

To build this game, we'll start by setting up gravity and tilt:

```typescript
{{#include game_03.ts:26:28}}
```

Now we can add a destination, and a hero who can jump and move via tilt:

```typescript
{{#include game_03.ts:31:44}}
```

We'll indicate what to do when the level is won or lost:

```typescript
{{#include game_03.ts:47:49}}
```

And finally, we'll set a timer for losing the level.  We'll also display the
timer on the HUD.

```typescript
{{#include game_03.ts:51:55}}
```

Before moving on with this chapter, you should try to add a goodie that adds
time to the counter.  If you're not sure where to start, you might want to
review the previous section.
