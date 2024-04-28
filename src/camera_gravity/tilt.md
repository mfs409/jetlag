## Tilt, as a Prelude to Gravity

The `stage` in our game is running a full physics simulation.  In the default
game code, we can't really see that simulation very much, because our arrows
interact with the hero's `ManualMovement` component to give it a fixed velocity.
As a prelude to thinking about gravity in interesting ways, let's change the
behavior of the arrow keys, and the movement component of the hero.

The best way to think about what we're going to do here is to think of a mobile
game, where your phone is like a table and you're trying to tilt the phone to
get a marble on the table to move through a maze.  The first thing we'll do is
change the hero's movement to `TiltMovement`:

```typescript
    movement: new TiltMovement(), // was `new ManualMovement(),`
```

You can put this line anywhere *inside* the `builder()` function.  A good thing
to think is "`builder` runs before my game starts, so the order in which I
configure the different parts of the game shouldn't matter".  Later on, we'll
find that the order matters in some specific cases, but nothing we need to worry
about yet.

When you add this code to `builder`, VSCode should help you to update your
`imports`, because we need to import `TiltMovement`.  If VSCode didn't do it for
you, update the import at the top of the file to look like this:

```typescript
import { ManualMovement, TiltMovement } from "../jetlag/Components/Movement";
```

We're going to get the affect of tilting a phone by using the keyboard to
simulate a phone's accelerometer.  First, let's enable the accelerometer by adding this line:

```typescript
  // Configure tilt: arrow keys will simulate gravitational force, with a
  // maximum of +- 10 in the X and Y dimensions.
  stage.tilt.tiltMax.Set(10, 10);
```

Then we can change the key handlers, so that they cause JetLag to pretend the accelerometer is producing measurements:

```typescript
  // Pressing a key will induce a force, releasing will stop inducing that force
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = 0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = -5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
```

While the game *looks* the same, now the behavior of the hero will be quite a bit different.

```admonish note
Programming the game to use tilt is often more convenient than
using arrow keys, so this book tends to use tilt a lot, even though it
isn't the best choice for most games.
```
