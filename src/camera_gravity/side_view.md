## A "Side-View" Game

Next, let's build a game where gravity is downward, and the camera is to the
"side" of the actors.  This is the perspective you might seen in a platformer
game, like Super Mario Bros, or in an endless runner game like Jetpack Joyride.

<iframe src="./game_03.iframe.html"></iframe>

Before we start writing code, let's briefly discuss what is happening in this
game:

- There is a destination that the hero needs to reach in order to win
- There is a time limit
- Gravity is downward, the world has boundaries, and the camera follows the hero
- Arrow keys control the hero
- Tapping or clicking the hero makes it jump

Note that in this game, there are no graphics assets.  That means we can start
from here: [game.ts](../empty/game.ts)

The first thing we'll do is put a grid on the screen:

```typescript
{{#include game_03.ts:21:22}}
```

Next, let's set up the boundaries on the world.  Other than changing a few
numbers, this is the same code as in our last game.

```typescript
{{#include game_03.ts:24:51}}
```

Next, let's add a hero.  We'll say that when you click or tap the hero, it will
"jump".  JetLag has a better way of doing jumping, but for now, we'll just do it
this way, because this code is hopefully pretty familiar.

```typescript
{{#include game_03.ts:53:61}}
```

Tapping the hero does make it go up, but it never comes back down.  That's
because we need to put some gravity into the world.  Note that you could change
the gravity on the fly (for example, in response to a gesture).  That could make
for an interesting change to the gameplay.  For now, we'll just call
`setGravity` once, in builder, while setting up the game:

```typescript
{{#include game_03.ts:63:65}}
```

Now let's configure the arrow keys, so the hero can move left/right:

```typescript
{{#include game_03.ts:67:71}}
```

Of course, we'll want the camera to follow the hero:

```typescript
{{#include game_03.ts:73:74}}
```

Next, we'll add a way to "win" the game.  This will involve a destination.
Notice that the destination doesn't have a `movement`, so its rigidBody will
just hover in place.

```typescript
{{#include game_03.ts:76:84}}
```

If we want there to be a time limit, all we need to do is put a number into the
"lose countdown" timer:

```typescript
{{#include game_03.ts:86:88}}
```

While that counter worked, it would be annoying to play a game where the player
couldn't see how much time was left.  In JetLag, we can use text as the
appearance for an actor.  Unfortunately, just writing some text is probably not
going to look too good, so let's make two actors.  We'll put them both on the
HUD.  The first will just be a gray box.  The second will be the text.

```typescript
{{#include game_03.ts:90:99}}
```

For the most part, this code looks like everything else we've been writing...
but then there's this part: `() => (stage.score.getLoseCountdownRemaining() ??
0).toFixed(0)`.  One reason this is complex is because of the rules of the
programming language we are using.  Briefly, until we said
`setLoseCountdownRemaining(10)`, calls to `getLoseCountdownRemaining()` would
not return a number... they'd return `undefined`.  So
`(stage.score.getLoseCountdownRemaining() ?? 0)` can be read as "the number of
seconds remaining, if it's not undefined, and 0 otherwise.  Then, we use
`toFixed(0)` to chop the decimal point off of the number.

But what about the `()=>` part?  First of all, that's shorthand.  We could have
said `() => { return (stage.score.getLoseCountdownRemaining() ?? 0).toFixed(0);
}`.  But in TypeScript, if you are making a function using the `()=>{}` syntax,
and the body (in `{}`) only has a single return statement, then you can skip the
`{}` and skip the word `return`.

But that didn't address the real question.  Why do we need a function here?  Why
can't we just say `(stage.score.getLoseCountdownRemaining() ?? 0).toFixed(0)`?
The answer is that every time we call `getLoseCountdownRemaining()`, we get its
current value.  But when we make the `TextSprite`, the game hasn't started yet!
If we read that value, it would be 10, and the counter would always report "10".

By wrapping the code like this (we sometimes say "making the code into a
callback" or "wrapping it in a lambda"), we're really saying that we want JetLag
to re-compute the text that is being displayed.  JetLag runs at 45 frames per
second, so we should expect the text to be re-computed that often.  If we did
`.toFixed(1)`, we'd see one decimal point.  If we did `.toFixed(2)`, we'd see
two decimal points, but the number wouldn't increment in units of .01, so we'd
actually be able to reverse engineer the frames per second.

As you're testing out this code, it might be a good idea to set `hitBoxes` to
false, so you can get a better sense for what the game would really look like.

To recap, [here's all of the code we just wrote](game_03.ts).  Be sure to make
changes to it and see if you can predict how it will behave:
