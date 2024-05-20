## Changing The Hero's Behavior With Sensors

Sensors detect when they collide with a hero, and they run some code.  In [this
example](game_07.ts), we have three sensors, each of which affects the hero's
movement:

<iframe src="game_07.iframe.html"></iframe>

To make this mini-game, we start by creating a hero.  We'll control it via Tilt:

```typescript
{{#include game_07.ts:32:37}}
```

Next, we draw the sensors.  Notice how I'm using the `z` of the appearance to
determine which go under or over the hero.  Also remember that if two things
have the same z (the default is 0), then the one we make second will go "on top
of" the one we make first.

Sensors always have a `heroCollision` function.  It always provides the sensor
and hero as arguments to the function.  The sensor comes first.  Since we don't
use it in our code, we prefix the name with an underscore (e.g., `_self`), so
that TypeScript knows that we intended not to use it.

```typescript
{{#include game_07.ts:39:65}}
```
