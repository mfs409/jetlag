## Tap: The Most Basic Gesture

Tapping is the most straightforward gesture.  When the device running your game
supports touch, tap represents a touch and release of the touch screen.
Otherwise, it is accomplished by clicking and releasing while your mouse is over
a specific actor.

The big question when setting up tap is "what should be tappable".  It's easy to
think "the actor", but if an actor moves around a lot, then it might be hard to
tap.  Especially for mobile devices, sometimes the right answer is to just cover
the whole screen (i.e., the HUD) with a button.

<iframe src="./game_01.iframe.html"></iframe>

In this [game](game_01.ts), you need to jump and collide with the destination.
If you miss it, you'll keep moving to the right, and you'll collide with an
invisible enemy, causing the level to restart.  The whole screen is tappable.

We start the level by creating a bounding box, setting up gravity, and making a
hero who is always moving:

```typescript
{{#include game_01.ts:33:43}}
```

Next, we can add the destination and an enemy:

```typescript
{{#include game_01.ts:45:57}}
```

Finally, we make the button:

```typescript
{{#include game_01.ts:59:63}}
```
