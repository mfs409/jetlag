## The Flick/Swipe Gesture

Mobile games popularized the idea of flicking/swiping as a way to control
actors.  Let's see how to do it in JetLag:

<iframe src="./game_06.iframe.html"></iframe>

In this [game](game_06.ts), most of the code is similar to what we saw in the
dragging example.  We'll create a border, set gravity, and make some actors.
The ones who can be flicked will have an `extra` field containing the speed at
which they should move.

```typescript
{{#include game_06.ts:32:55}}
```

The main difference between swipe and pan is that swipe is a single event: we
don't see its start, move, and end as separate entities.  Instead, we get the
actor who received the swipe, the coordinate where the swipe began, the
coordinate where it ended, and the time that it took for the player to perform
the swipe.

Using this information, we have to do many things:

1. Figure out if there is an actor at the world coordinate that corresponds to
   where the swipe started.
2. Compute the velocity (direction, magnitude) of the line from the starting
   coordinate to the ending coordinate.
3. Multiply that velocity by the speed that we assigned to the actor.
4. Apply that velocity to the actor.

```typescript
{{#include game_06.ts:57:80}}
```

Once again, we see that the function for what to do is much more complicated
than the code for making the button:

```typescript
{{#include game_06.ts:83:87}}
```

In the code above, one interesting thing to note is that we never bothered to
translate the vector from hud coordinates to world coordinates.  That's safe,
because both were in meters.  However, if we had some notion of zoom, then we
might need to scale the vector by the zoom factor.  Another thing you'll notice
is that we didn't scale the vector by `flickspeed/time`.  Instead we also
multiplied it by 2000.  I chose 2000 because it made things feel right.  You
will find that for your games, based on actor sizes and densities, you might
have to come up with a multiplier like that.  It usually requires some trial and
error.
