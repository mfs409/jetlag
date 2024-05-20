## Animations With Varying Time

Sometimes we want the different frames of an animation to display for different
lengths of time.  For example, when a character is standing idly, we might want
them to just shrug every now and then, so it's clear they aren't a statue.  Here's [the code](game_10.ts) for a game that shows this behavior, and here's how it looks when it runs:

<iframe src="./game_10.iframe.html"></iframe>

We'll get this behavior by making our `AnimationSequence` in a different way.
Instead of using an array of image names, we'll use the `.to()` syntax (similar
to `PathMovement`) to give a time (in milliseconds) for each frame.

To begin, let's make the animation object.  I'm being a more terse in this code,
by not using `let` to create a variable for the `AnimationSequence`... instead,
I'm just making it on the fly, while putting it into the map.

```typescript
{{#include game_10.ts:27:28}}
```

With the animation made, we can use it in the same way as before, by giving an
actor an `AnimatedSprite` as its appearance:

```typescript
{{#include game_10.ts:33:38}}
```
