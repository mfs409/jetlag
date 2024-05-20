## Changing Timer Speeds

Some game frameworks have a way of saying that a timer should wait a few
seconds, then start running at some interval.  Others have a way of changing a
timer's frequency on the fly.  JetLag does not support either of these.  If you
need a timer to wait before it starts repeating, you can just create it from
*within another timer*.

It would be easy enough to change the `TimedEvent` so that its interval could be
updated on the fly.  For now, if you need this behavior, your best bet is to run
your timed event at a very high rate, and compute the real frequency inside of
the timer code.  Here's an [example](game_05.ts):

<iframe src="./game_05.iframe.html"></iframe>

Part of the trick for making this work is that we know that JetLag ony runs at
45 frames per second, so we can use a very fast timer, and not worry about it
ever going "too fast".  In the example below, the timer runs every half second.
Let's call this a "tick".  We count the ticks via the `counter` variable.  We
also use the number of defeated enemies as the "phase".  When none have been
defeated, the phase is 10, so it takes 10 ticks before the counter does any
work.  As the number of defeated enemies goes up, the phase goes down, until it
reaches 1, at which point a new enemy will be produced every tick (i.e., every
half second).

```typescript
{{#include game_05.ts:26:49}}
```
