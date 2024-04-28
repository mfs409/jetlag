## Manually Advancing Animations

When we learned about `PathMovement`, one neat feature was the ability to re-use
the same path, but "advance" it for different actors, so they didn't start at
the same place.  We can do the same for animations:

<iframe src="./game_09.iframe.html"></iframe>

The first part of this code is just like before: we make a map and set up an
animation for the `IDLE_E` state:

```typescript
    let animation_map = new Map();
    let coins = AnimationSequence.makeSimple({
      timePerFrame: 50,
      repeat: true,
      images: ["coin0.png", "coin1.png", "coin2.png", "coin3.png", "coin4.png", "coin5.png", "coin6.png", "coin7.png"]
    });
    animation_map.set(AnimationState.IDLE_E, coins);
```

This time, though, we'll make a loop that draws 16 coins.  For each coin, we'll
use "skip to" to jump forward in the animation sequence.  When skipping, we can
select which frame of the animation to use, and how many milliseconds into the
frame to pretend have transpired.  In this code, we use `Math.trunc(i/2)` to
turn the loop index into a whole number for the frame, and then we use
`(i%2)*.25` so that every other coin will be halfway through its 50-millisecond
animation.

```typescript
    // Now we can use it
    for (let i = 0; i < 16; ++i) {
      let coin = new Actor({
        appearance: new AnimatedSprite({ width: .5, height: .5, animations: animation_map }),
        rigidBody: new CircleBody({ cx: i + .5, cy: 2, radius: .25 }),
      });
      (coin.appearance[0] as AnimatedSprite).skipTo(Math.trunc(i / 2), (i % 2) * .25);
    }
```

