## IDLE_E: The Default Animation

Let's make our first animated sprite.  It will use the coin images from `sprites.png` to make a coin that rotates:

<iframe src="./game_08.iframe.html"></iframe>

The easiest way to make an animation is to use `AnimationSequence.makeSimple()`.
It lets us take a bunch of images and create a flipbook-style animation by
cycling through them one at a time, showing each for the same amount of time.
We can make an animation for our coins like this.  Since `repeat` is true, it
will restart once it reaches the end:

```typescript
    let coins = AnimationSequence.makeSimple({
      timePerFrame: 50,
      repeat: true,
      images: ["coin0.png", "coin1.png", "coin2.png", "coin3.png", "coin4.png", "coin5.png", "coin6.png", "coin7.png"]
    });
```

In JetLag, the default animation is `IDLE_E`.  Every `AnimatedSprite` needs to
have this.  But how do we get it to the actor?  It would be tedious to have to pass in 80 different animations, so instead we create a map.

Briefly, a map is like a phone book or dictionary: it lets us associate some
value with some other value (kine of like a name to a phone number, or a word to
its definition).  Our map will go from the different animation states to
`AnimationSequence`s.  For this example, we just need one animation, so it's
pretty easy:

```typescript
    let animation_map = new Map();
    animation_map.set(AnimationState.IDLE_E, coins);
```

Now that we've done that, we can make an actor whose appearance is an
`AnimatedSprite`:

```typescript
    new Actor({
      appearance: new AnimatedSprite({ width: .5, height: .5, animations: animation_map }),
      rigidBody: new CircleBody({ cx: 5, cy: 2, radius: .25 }),
    });
```

