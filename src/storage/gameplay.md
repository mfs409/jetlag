## Setting Up The Gameplay

Now we can set up the gameplay.  We'll start with the border, the gravity, and a
hero:

```typescript
{{#include game_01.ts:105:122}}
```

Next, we'll intersperse enemies and goodies, and draw a destination:

```typescript
{{#include game_01.ts:124:147}}
```

And then we'll put two counters on the HUD: one for coins, the other for rubies.
Notice how the coin count combines the values from `sstore` and `lstore`, so the
player knows how many coins they'll have *if they win*.

```typescript
{{#include game_01.ts:149:167}}
```

We'll configure the win and lose behaviors, and set up an overlay that prints a
message when the player loses.  During the gameplay, we did not make any
modifications to `sstore` or `pstore` that would need to be rolled back, and we
know that when the level restarts, `lstore` will be reset, so we don't need any
special code, just a message.

```typescript
{{#include game_01.ts:169:185}}
```

In contrast, when the level is won, we're going to have to do some real work.
Note that we could have done this in the destination's arrival function,
instead, but since I wanted the overlay to tell the player how many rubies they
minted and how many coins they minted, this was a little bit easier.

In the `winSceneBuilder`, we'll start by moving coins from the `lstore` to the
`sstore`.  This signifies that any coins that were collected have become
"permanent".

The next thing we do is convert coins to rubies.  It may seem odd that I'm using
a `while` loop here, instead of doing some smarter math.  I really only did that
because I wanted to show a `while` loop.  A `while` loop will run over and over,
as long as the condition in parentheses is true.  In this case, each time the
loop runs, `sstore.coins` will get smaller, until eventually there are not
enough coins to make another ruby, and the loop will end.  

```admonish Note
This kind of code would be inefficient if `sstore.coins` could be large.
It's OK here, because sstore won't ever get above 12.
```

If we minted any rubies, we'll update `pstore` and call `persist()`.  After
that, all that remains is to set up a border, so that tapping will clear the
overlay and start the level, and to put some text on the screen.

```typescript
{{#include game_01.ts:187:221}}
```
