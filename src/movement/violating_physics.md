## Violating The Laws Of Physics

In this next mini-game, we'll start building out something common in
"platformer" games: a hero who can jump onto a floating platform.  You can play
the game below, and find its code [here](game_08.ts)

<iframe src="game_08.iframe.html"></iframe>

The most interesting thing about this mini-game is not what it does, but what it
doesn't do.  You should expect that when the hero (a box) is teetering off of
the edge of the platform, it should tip over.  That's what the laws of physics
say should happen.  Since that's not what we want in our game, it's up to us to
disable such behavior.  We do that by adding an explicit instruction that the
hero's rigid body shouldn't rotate.

Here's the start of the game: we have gravity, a border, and a hero who won't
accidentally rotate.  You should try turning the `false` to `true`, and watch
how the behavior of the Hero changes when it's walking off the platform.

```typescript
{{#include game_08.ts:25:37}}
```

Next, we make a floating platform.  Since it's an Obstacle, the hero won't pass
through it.  Since we didn't give it movement, it's a static body, so it won't
fall.

```typescript
{{#include game_08.ts:39:43}}
```

One weird thing here is that jumping is a special behavior.  It's not part of
the movement, it's part of the hero role.  The reason for this is that in some
games, we need to know if something is "in the air".  The real thing to remember
here is that any time you're writing code, you'll find places where you have to
make decisions that aren't clean and obvious.  There are ways to rewrite JetLag
so that jumping is a movement, not a part of the Hero role.  I did it this way,
because it worked for my goals.  It's not objectively good or bad.

```typescript
{{#include game_08.ts:47:52}}
```
