## Gestures In The HUD And World

In the previous levels, any single kind of gesture only happened in one place.
That doesn't always make sense.  For example, suppose that we wanted to make a
game where you could tap an actor, then tap the screen, and the actor would
teleport to that location.  Should the HUD get the tap first?  Should the world?

First, let's look at the [game](game_07.ts) we're making.  There are three
actors.  Tapping one "activates it".  Tapping the screen will make one actor
"teleport" to that spot, another move *to* that spot via a path, and the third
actor move *toward* that spot, but not stop when it reaches it.

<iframe src="./game_07.iframe.html"></iframe>

By default, JetLag routes gestures to the HUD first, and the world second.  We
can override this behavior:

```typescript
{{#include game_07.ts:84:86}}
```

Then we'll put a border on the world:

```typescript
{{#include game_07.ts:32}}
```

Each actor is going to have an `extra` that has a function in it called
`poke_responser`.  The idea is that tapping an actor will "activate" it, and
tapping anywhere else will call the activated actor's `poke_responder`.  So
then, the first thing we'll need is a way to track the activated actor:

```typescript
{{#include game_07.ts:34:35}}
```

Next, let's make an actor who can "teleport".  Tapping it will "activate" it.
Double-tapping will remove it.  We'll detect a double tap by recording the time
of the tap.  Two taps within 300 milliseconds feels about right for a double
tap, so we'll compare the time of the taps and see if they're less than 300ms
apart.  Finally, the `poke_responder` will simply change the coordinates of this
actor.

```typescript
{{#include game_07.ts:37:62}}
```

Next, let's make the actor who moves via a path.  The tricky issue here is that
we need it to start with a path, because we can't change the `movement` on the
fly.  So we give it a path with one point and zero velocity.  Then, in its
`poke_responder()`, we reset its speed and angular velocity, then give it a new
path.

```typescript
{{#include game_07.ts:89:105}}
```

Our third actor will move *toward* the position that was poked.  This requires a
little bit of trig, to compute the direction.

```typescript
{{#include game_07.ts:108:127}}
```

Finally, we can cover the HUD with an actor.  Tapping it will check if there is
an "activated" actor.  If so, we'll translate the touch to world coordinates and
give those coordinates to the activated actor's `poke_responder()`.

```typescript
{{#include game_07.ts:66:82}}
```

You should see what happens if you change this code.  For example, do you like
the effect that you get if you skip `lastTapActor = undefined`?  What happens if
you tap one actor, then another?  Can you think of a better way to manage taps
between the HUD and the world?
