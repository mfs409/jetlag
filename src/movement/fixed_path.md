## Moving Along A Fixed Path

In many games, we need an actor to move along a path.  We're going to make a
very busy mess of a game.  Here's what it will look like when we're done (and [here](game_02.ts) is the code):

<iframe src="game_02.iframe.html"></iframe>

To get started, you'll need an empty [game.ts](../empty/game.ts), [common.ts](../common/common.ts), and these
files:

- [red_ball.png](../assets/red_ball.png)
- [green_ball.png](../assets/green_ball.png)
- [grey_ball.png](../assets/grey_ball.png)
- [purple_ball.png](../assets/purple_ball.png)

In JetLag, we define a path as a set of waypoints.  When the level starts, the
actor will immediately teleport to the first waypoint, and start moving toward
the second, using the velocity we provide.  When it reaches that waypoint, it
will start moving toward the next.  When it reaches the last waypoint, if we
have requested that the path repeat, then it will instantly teleport back to the
first waypoint and start over.

We'll start by putting an actor into the world who moves via Tilt, so that we
can make it interact with an actor moving via a path.  Then we'll make an actor
who moves along a path and stops:

```typescript
{{#include game_02.ts:31:46}}
```

Next, we'll add an actor who moves faster (5, instead of 2), and who loops.
Notice that the actor *teleports* back to the starting point.

```typescript
{{#include game_02.ts:48:58}}
```

If we want the actor to move back to the starting point, we need the final
waypoint to be the same as the first.

```typescript
{{#include game_02.ts:60:66}}
```

Of course, paths can go from anywhere to anywhere... even off the screen.  Also,
notice that if an actor's body is static when the path is attached to it, it
will become kinematic, not dynamic.  That means that it can go through walls.
Also notice that in this example, we're using some code to make a more complex
path, which we're calling `p`.

```typescript
{{#include game_02.ts:68:86}}
```

If a point on the path is directly between two other points, you won't notice
it's there.  The velocity is all that matters.  At first, this might seem like a
kind of silly thing to point out...

```typescript
{{#include game_02.ts:88:95}}
```

But once we've done that, we can re-use the path, letting the next actor jump
forward by a waypoint.  Also, notice that when we do this, if we don't have the
`cx` and `cy` values correct, it's OK.  The actor teleports to its starting
point right away.

```typescript
{{#include game_02.ts:97:104}}
```

We can make actors on paths dynamic.  This is usually a bad idea if collisions
are enabled (which is, of course, the default).  Try colliding with this actor
and knocking it off of its path.  It will mess up the whole path system.

```typescript
{{#include game_02.ts:109:114}}
```

Lastly, let's observe that we can run code whenever an actor reaches a waypoint.
In this example, we'll only do something on the second waypoint (waypoint #1)
and the fourth waypoint (waypoint #3).  In each case, we'll just put a goodie up
in a location that's hard to reach.

```typescript
{{#include game_02.ts:117:130}}
```

Whew, that was a lot!  Before you move on to the next part of this chapter,
please take some time to play around with the numbers and watch what happens.
Paths can be tricky to get right, but they can also be very useful.
