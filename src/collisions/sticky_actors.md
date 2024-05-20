## Sticky Actors

It can be useful to make a hero stick to an actor.  As an example, if the hero
should stand on a platform that moves along a path, then physics says that the
hero will slide on the platform as it moves left/right (unless there is a lot of
friction), and the hero will "bounce" when the platform goes from moving upward
to moving downward.  In the following [game](game_01.ts), you should move the
hero onto each platform, and watch how its behavior changes.

<iframe src="./game_01.iframe.html"></iframe>

To make this example, we'll start by setting up some gravity and a hero.  The
hero can move left/right via the arrow keys, and can jump via the space bar:

```typescript
{{#include game_01.ts:30:42}}
```

Now we'll make a platform that moves in a diamond shape.  This platform is
sticky on top, via the `stickySides` argument to its rigid body

```typescript
{{#include game_01.ts:45:50}}
```

Now we'll make another platform, without stickiness.  You should try to use
friction (on the hero and platform) to avoid the sliding and bouncing behaviors.
You'll probably find that it's too hard to get it to work nicely while still
having the rest of the hero movement the way you want it.

```typescript
{{#include game_01.ts:57:62}}
```

You can make several a different side sticky, by using `Sides.BOTTOM`,
`Sides.RIGHT`, or `Sides.LEFT`.  You can also put several sides into the
`stickySides` array, by separating each with a comma.
