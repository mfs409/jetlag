## Tilt, as a Prelude to Gravity

The `stage` in our game is running a full physics simulation.  In the default
game code, we can't really see that simulation very much, because our arrows
interact with the hero's `ManualMovement` component to give it a fixed velocity.
As a prelude to thinking about gravity in interesting ways, let's change the
behavior of the arrow keys, and the movement component of the hero.

The best way to think about what we're going to do here is to think of a mobile
game, where your phone is like a table and you're trying to tilt the phone to
get a marble on the table to move through a maze.  The first thing we'll do is
change the hero's movement to `TiltMovement` on line 30:

```typescript
    movement: new TiltMovement(), // was `new ManualMovement(),`
```

When you change this line, VSCode should help you to update your `imports`,
because we need to import `TiltMovement`.  Often, pressing the `tab` key while
typing `TiltMovement` will cause VSCode to figure out the import.  If VSCode
didn't do it for you, update the import at the top of the file to look like
this:

```typescript
{{#include game_00.ts:1}}
```

We're going to get the affect of tilting a phone by using the keyboard to
simulate a phone's accelerometer.  First, let's enable the accelerometer by
adding this code:

```typescript
  // Configure tilt: arrow keys will simulate gravitational force, with a
  // maximum of +- 10 in the X and Y dimensions.
  stage.tilt.tiltMax.Set(10, 10);
```

You can put this line anywhere *inside* the `builder()` function.  A good thing
to think is "`builder` runs before my game starts, so the order in which I
configure the different parts of the game shouldn't matter".  Later on, we'll
find that the order matters in some specific cases, but nothing we need to worry
about yet.

Then we can change the key handlers, so that they cause JetLag to pretend the
accelerometer is producing measurements:

```typescript
{{#include game_00.ts:47:55}}
```

While the game *looks* the same, now the behavior of the hero will be quite a
bit different.  Be sure to use the arrow keys to simulate tilting:

<iframe src="./game_00.iframe.html"></iframe>

Below is a copy of the code for our tilt-enabled game.  You'll notice that in
VSCode, line 26 is yellow, because the hero variable is no longer used.  You can
remove the words `let hero =` in order to fix the warning.

```typescript
{{#include game_00.ts}}
```

```admonish note
It's not common for games to use tilt.  However, in this book, we use tilt *a 
lot*, because it helps to keep the examples from getting too long.
```
