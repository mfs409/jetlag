## The Hard Part: `levels.ts`

`levels.ts` is going to be quite a bit more difficult than everything else we've
done so far.  One thing is that we'll need to have nine different levels,
because of how we set up our chooser.  But it's also time to think about how to
make the transitions more pleasant.

You've already seen the `world` and the `hud`.  There can be other scenes in
JetLag, but they're short-lived.  We call them "overlay" scenes.

An overlay scene is defined by a builder function.  If you call
`stage.requestOverlay()` and give a builder function, then your game will
immediately pause, that overlay will be drawn, and it will stay until you call
`stage.clearOverlay()`.  Here's an example: this code will ask for an overlay,
which pauses the game.  When it gets an overlay, it will put a black background
on it, then write some text in the middle.  Clicking the background will clear
the overlay, resuming the game.  This also shows something very cool that we
haven't seen before: an `Actor` can have several `appearance` components.  In
this case, we make a `FilledBox` *and* a `TextSprite`, both centred on the
`rigidBody`:

```typescript
{{#include levels.ts:412:437}}
```

It turns out that whenever we make an overlay, we can optionally also get a
screenshot of the game *immediately before* the overlay was made.  Here's a
pause scene.  You'll see that it receives the screenshot as an `ImageSprite`,
and uses it to make the background.  The pause scene is also interactive.  It
can cause the game to go back to the chooser, and it could even change things
inside of the current level of the game.

```typescript
{{#include levels.ts:439:472}}
```

Since overlays can interact with the world, we'll make a special way of pausing
the game.  In this variant, there will be buttons for winning instantly, losing
instantly, and powering up the hero.

```typescript
{{#include levels.ts:475:554}}
```

Finally, we'll write code for two more overlays: one to put when the level is
won, another for when the level is lost.  Note that these do not use
`requestOverlay`.  In JetLag, the score is able to store the builders for the
win and lose overlays.  This lets JetLag create the overlay when it figures out
that the player has won or lost.

```typescript
{{#include levels.ts:556:604}}
```

Now that we've got all of our helper code for making overlays, let's write the
nine levels of the game.  You'll notice that I'm providing the whole `builder()`
function, exactly as I would write it.  There are a few things to notice:

- For the most part, each level builds on the one before it, so hopefully
  they're not too hard to understand.
- We go back to using the same music as in the splash screen.
- The code uses the pattern `if (level == xxx)` and `else if (level == xxx)` to
  separate the code for the different levels.
- Before the first `if (level == xxx)`, there is some common code that runs no
  matter which level is being created.

```typescript
{{#include levels.ts:6:410}}
```
