## Chasing In One Dimension

`ChaseMovement` takes some *optional* parameters.  You can see them by hovering
your mouse over the word `ChaseMovement` in VSCode.  One that is quite useful is
to limit chasing to only one dimension (X or Y).  This can be useful for things
like a goalie in a hockey or soccer game, or a pong controller.  It can also
make for some nice visual effects.

<iframe src="game_04.iframe.html"></iframe>

The above game is built from [this code](game_04.ts).  The interesting part is
how we make the red indicators.  One has `chaseInX` false, and the other has
`chaseInY` false.

```typescript
{{#include game_04.ts:39:52}}
```

In the next game, we'll have an actor who only chases in one direction. This
level also shows some JetLag features.  You don't need to worry about
understanding them too well yet.  They're just here so that you can keep in mind
how little changes and small bits of code can make for very different styles of
gameplay.

<iframe src="game_05.iframe.html"></iframe>

The code for this game is [here](game_05.ts)

In the level, we start with tilt in the X dimension, gravity, and a bounding
box:

```typescript
{{#include game_05.ts:26:28}}
```

Next, we'll put in a background that auto-scrolls.  This can look very good in
some games, though in our game it doesn't look all that great.  The speed number
you see is something I found by guessing.  You'll want to change it until you
find a speed that works for your game concept.

```typescript
{{#include game_05.ts:32:37}}
```

In this game, the hero can jump.  You can tap/click the hero to make it jump,
and when it does, it will get a boost upward (negative Y).  Using tilt while in
the air is the only way to get around the red ball.

```typescript
{{#include game_05.ts:40:54}}
```
