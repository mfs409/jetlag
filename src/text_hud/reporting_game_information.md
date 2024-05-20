## Reporting Game Information

When we use the "producer" form (`()=>{}`) to generate the text for a
`TextSprite`, we gain the power to report on the status and behavior of any
actor in the world.  Here's an [example](game_06.ts), where our text reports the hero's
coordinates:

<iframe src="./game_06.iframe.html"></iframe>

We start this mini-game by creating a hero who moves via keyboard, and centering
the camera on it:

```typescript
{{#include game_06.ts:24:28}}

{{#include game_06.ts:37:42}}
```

Then we can put a text box on the screen that reads the hero's position and
displays it.

```typescript
{{#include game_06.ts:30:35}}
```

However, this brings up a new problem... the text is part of the `world`, and
the hero can move very far away from where we drew the text.  When that happens,
we can't see the text anymore.  (We'll ignore how, without a background, it
doesn't really look like the hero is moving.)

The solution to this problem is a very small bit of code, but a very big idea.
In JetLag, the `stage` actually has two independent physics simulations running
at all times.  One is the `stage.world`.  The other, which is slightly less
powerful, is the `stage.hud` (heads-up display).  The best way to think about
the hud is to think "sometimes, I don't want to draw an actor on the world,
instead I want to draw it *on the camera itself*".

We can put any actor on the HUD by adding some configuration to the rigid body:

```typescript
{{#include game_07.ts:32}}
```

<iframe src="./game_07.iframe.html"></iframe>```

And with that tiny change to [the code](game_07.ts), the text will stay right where we want it.  Be sure
to open the developer console (`F12`) and compare the "World Touch" and "Hud
Touch" values as you move around in the world.  You'll see that the HUD stays in
a fixed position.
