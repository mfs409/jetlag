## Using The HUD

Our last game worked, but it was a **bad design**.  The problem is that we put
the button in the world.  If we made the world bigger, the button could go out
of view.

In the next [game](game_02.ts), we'll put the invisible button *on the HUD*.
This is an important point... since the world is large, putting the button on
the HUD is the only reasonable way to make sure it doesn't go out of view.

<iframe src="./game_02.iframe.html"></iframe>

To make this game, we'll start by setting up a wider bounding box, and then
setting the camera bounds:

```typescript
{{#include game_02.ts:34:36}}
```

Any time the world gets large, and the camera centers on the hero, it's easy for
it to look like the hero isn't moving.  Having a varied background addresses the
problem, so we'll stretch `noise.png` to cover the visible world:

```typescript
{{#include game_02.ts:39:42}}
```

Again, we'll make a hero, but this time we'll focus the camera on it:

```typescript
{{#include game_02.ts:44:52}}
```

Also, we'll make a destination and an enemy that covers the right wall of the
world, so that the level will restart if the hero doesn't reach the destination.

```typescript
{{#include game_02.ts:54:66}}
```

Finally, we'll make our button, but this time we'll put it on the HUD:

```typescript
{{#include game_02.ts:68:73}}
```
