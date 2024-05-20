## Side-View Animations

A lot of what we've seen so far has been specific to games with an overhead
view.  Let's now make a side-view game, to see how remapping works a little bit
differently.  Here's the [game](game_14.ts) we'll make:

<iframe src="./game_14.iframe.html"></iframe>

In the game, tilt moves the actor left/right, but there is a lot of friction to
slow things down.  This will let us really see the animations in detail.

We'll start by setting up gravity, tilt, a bounding box, and a background:

```typescript
{{#include game_14.ts:29:31}}
{{#include game_14.ts:33}}
{{#include game_14.ts:35}}
```

The hero has one animation when it is not in the air, another when it is.  Note
that "jump_right" will also be used when jumping to the left, if there is no
"jump_left".  With that as our plan, we can make the two animations like this:

```typescript
{{#include game_14.ts:42:46}}
```

You probably guessed that we'll want to do some re-mapping:

```typescript
{{#include game_14.ts:47:49}}
```

But in truth, there's a lot more remapping that it seems like we need.
Fortunately, there is another way.  JetLag understands that there are two
dominant views (overhead and side), and that there are different (but still
reasonable) default re-mappings for each.  Let's make our hero:

```typescript
{{#include game_14.ts:51:57}}
```

Instead of remapping JUMP_NE, JUMP_SE, JUMP_NW, JUMP_SW, we can tell the
AnimatedSprite that this is a side-view game, and it will do the work for us.

```typescript
{{#include game_14.ts:62}}
```

Note that you can make your own transition maps and assign them to the
`stateSelector`.  The default one is for overhead view, and JetLag only
provides one more, for side view.  If you need something else, you've
probably advanced to a point where you don't need a chapter of this book to
help you figure it out!

The last thing we'll do in our game is add a disappearance animation.  We'll add
a goodie, and give it an `onDisappear` component.  The component will draw a new
actor (with `Passive` role) and give it an animation that does not repeat.  The
last frame of the animation will be a blank image.

```typescript
{{#include game_14.ts:66:78}}
```
