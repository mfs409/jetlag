## Keeping An Eye On The World

Sometimes we need to watch what's happening in the world, so we can make
on-the-fly corrections.  One example is the "block breaker" game from a previous
chapter, where we might want to do a periodic check to see if the ball lost its
vertical velocity.  Timers that run at a high frequency are a convenient way to
do this.

In the following [game](game_04.ts), there is an invisible destination.  (Well, right now the
hit boxes are turned on, so it's not *entirely* invisible...).  We'll use timers
to monitor the location of the hero and destination, and to update the hint text
accordingly.

<iframe src="./game_04.iframe.html"></iframe>

To make this level, we'll start by setting up gravity and tilt:

```typescript
{{#include game_04.ts:28:30}}
```

Next, let's add the destination.  We'll use an extra "00" in the color to make
it invisible.  We'll also add a hero.  Our timer is going to need to use these
actors, so we'll assign them to variables `d` and `h`, so that they have names
that the timer code can use:

```typescript
{{#include game_04.ts:33:44}}
```

Next, let's set up winning and losing:

```typescript
{{#include game_04.ts:47:49}}
```

Now let's put two text boxes on the HUD, to indicate the directions that the
hero needs to move in order to find the destination.  Notice that we start by
making two variables, `ud` and `lr`, and the text boxes re-compute their text
based on the values of these variables.  That's very important!  We're going to
change their values using a timer, and when we change their values, we need the
text boxes to update.

```typescript
{{#include game_04.ts:54:63}}
```

Finally, we'll add our timer.  This code says "run every .01 seconds".  That's
very fast.  In fact, it's impossibly fast, because JetLag usually caps itself at
45 frames per second.  It's OK... the timer will run as frequently as it can,
but no more frequently, so this will effectively run every 1/45th of a second.

```typescript
{{#include game_04.ts:66:69}}
```

With that last bit of code in place, you should see that the hints update to
help the hero find its way to the destination.
