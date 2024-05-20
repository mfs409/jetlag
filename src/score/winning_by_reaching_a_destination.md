## Winning By Reaching A Destination

The destination role provides another way of winning a game.  We discussed this
already in the "Roles" chapters, but it's worth reviewing here.  In the
following level, we have a single destination that can hold two heroes, and to
win, they both must reach the destination:

<iframe src="./game_10.iframe.html"></iframe>

To create this [game](game_10.ts), we just need two heroes and a destination.
When we make the destination, we give it a capacity of 2, since the default is
1.

```typescript
{{#include game_10.ts:37:54}}
```

Then we tell JetLag that the level should end (in victory!) when two heroes
reach the destination.

```typescript
{{#include game_10.ts:55}}
```

Similarly, we can have several destinations, and then we can play around with
how much capacity each has.  In this [example](game_11.ts), there are two
destinations, each of which can hold one hero:

<iframe src="./game_11.iframe.html"></iframe>

You should try to implement this level on your own, before reading my code:

```typescript
{{#include game_11.ts:37:60}}
```
