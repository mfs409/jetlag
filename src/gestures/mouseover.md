## MouseOver Events

In mobile games, there's no real way of thinking about the mouse "hovering" over
part of the screen... either the player's finger is touching the screen, or it's
not.  However, in desktop games, it's common for hovering the mouse to *mean
something*.  It could be a way of indicating the direction to toss a projectile,
or the direction to move.  Other times, the mouse hover will cause an image to
animate.  This can be useful for an in-game inventory, for example.

In all of these cases, we need to know which actor the mouse is hovering over.
We can do this via the `mouseHover` gesture.  If you're reading this page on a
desktop or laptop computer, you'll see that the character's image changes when
your mouse hovers over the actor's top or bottom half.

<iframe src="./game_10.iframe.html"></iframe>

The full code for this game can be found [here](game_10.ts).

In the code, there is really not much of interest.  We start by making an actor
in a world:

```typescript
{{#include game_10.ts:24:37}}
```

Where things get interesting is when we attach some gestures to the actor.  In
this code, I added them after the actor was made, instead of while the actor was
being made.  You can do it either way, of course.

```typescript
{{#include game_10.ts:39:46}}
```

We need to provide code to run for two different gestures.  `mouseHover` is the
code that runs if the mouse is hovering over the actor.  `mouseUnHover` is the
code to run as soon as JetLag notices that the mouse has stopped hovering over
the actor.  Note that if your mouse hovers over an actor for a full second
`mouseHover` will run 45 times during that second, because that's how often
JetLag updates its screen.  While you might think that running once, when the
hover starts, is enough, notice that in this game, as the hover coordinates
change, so does the image.  We'd also need to run the `mouseHover` code
repeatedly if we were using hover for advanced targeting.
