## Animations With Varying Time

Sometimes we want the different frames of an animation to display for different
lengths of time.  For example, when a character is standing idly, we might want
them to just shrug every now and then, so it's clear they aren't a statue.

<iframe src="./game_10.iframe.html"></iframe>

We'll get this behavior by making our `AnimationSequence` in a different way.
Instead of using an array of image names, we'll use the `.to()` syntax (similar
to `PathMovement`) to give a time (in milliseconds) for each frame.

To begin, let's make the animation object.  I'm being a more terse in this code,
by not using `let` to create a variable for the `AnimationSequence`... instead,
I'm just making it on the fly, while putting it into the map.

```typescript
    let animations = new Map();
    animations.set(AnimationState.IDLE_E, new AnimationSequence(true).to("alien_thrust_r_0.png", 750).to("alien_thrust_r_1.png", 75));
```

With the animation made, we can use it in the same way as before, by giving an
actor an `AnimatedSprite` as its appearance:

```typescript
    new Actor({
      rigidBody: new BoxBody({ cx: 3, cy: 4, width: 1, height: 2 }),
      appearance: new AnimatedSprite({ width: 2, height: 2, animations }),
      role: new Hero(),
    });
```

