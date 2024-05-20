## "Activating" A Destination

In the discussion of Goodies, we had a way of saying *not* to collect a goodie
if some condition wan't met.  We can do the same with Destinations.  In the
[example](game_06.ts) below, the destination won't accept the hero until the
hero collects a goodie:

<iframe src="game_06.iframe.html"></iframe>

We will achieve this behavior by providing an `onAttemptArrival` function to the
`Destination`.  In it, we'll check that the goodie count (for type 0 goodies) is
not zero.  We'll also do another check: every actor has a built-in `extra`
field.  This field doesn't have a type, so we can use it however we want.  In
this level, we'll show its use by saying that when the hero collects the goodie,
the goodie will run code that updates the hero's `extra` with a field called
`collected`, which will be set to `true`.  The `onAttemptArrival` code doesn't
just look at the goodie count, it also checks this `extra` field.  If you had
two heroes, you'd be able to use this to insist that the hero who collected the
goodie be the one to reach the destination.

```typescript
{{#include game_06.ts:33:57}}
```
