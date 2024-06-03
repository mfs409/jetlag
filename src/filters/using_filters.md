## Using Filters In Your Game

Now that we have a bunch of filters on hand, let's put them to use.  We're going
to want to see how filters can be attached to a single Z plane, to the world, to
the HUD, and so forth, so let's start by making an infinite scrolling game:

<iframe src="./game_01.iframe.html"></iframe>

[Here](game_01.ts) is the full code for the game.  There's no real
interactivity, we just have a hero who moves rightward, with a parallax
background.  This code is based on the "Endless Runner" Demo, so if you're
having trouble understanding how things work (particularly the sensor), please
jump forward to that chapter.

Now that we've got the game, we can try out some filters.  I've already put in
some examples, but they're commented out.  In the `builder` you will find these
lines:

```typescript
{{#include game_01.ts:100:104}}
```

You'll also see this line in the `pauseGame` function:

```typescript
{{#include game_01.ts:136}}
```

Try uncommenting a line and re-running your game.  Then, try changing where the
filters are being drawn or used.  You'll discover that some, like the
SepiaTvFilterComponent, work very oddly, and only make sense when applied to the
whole game, whereas others work nicely when applied to just one Z index, or just
to the HUD, etc.

One thing you'll notice is that filters have a complicated relationship with
transparency.  This works nicely when you have an actor, like the hero, on its
own Z plane: filtering the whole plane will just filter the hero!  But the fade
in/out filters don't quite do what we want, because the blue background isn't
really part of the game, it's actually *behind* the game.  That means that our
fade sees that part of the world as "transparent", and doesn't fade it in or
out.
