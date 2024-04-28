## Using The Z Index

Every appearance component in JetLag has an optional "z" argument.  Z lets us
control how things overlap.  There are 5 Z levels: -2, -1, 0, 1, and 2. By
default, everything goes in Z=0.  Also, by default, things within a Z index
appear on top of things that were made before them in the same block of code.

To test this out, start by copying the `enableTilt` and `boundingBox` functions
from the Camera tutorial.  Then put this code into your `builder()`:

```typescript
    enableTilt(10, 10);
    boundingBox();

    // This actor will go "under" everything else in Z=0, since it was drawn first
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cx: 8, cy: 1 }),
      role: new Hero(),
      movement: new TiltMovement()
    });

    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "left_arrow.png" }),
      rigidBody: new BoxBody({ width: 1, height: 1, cx: 15, cy: 1 })
    });

    // But the actor will go *over* this, since its Z is -1
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "right_arrow.png", z: -1 }),
      rigidBody: new BoxBody({ width: 1, height: 1, cx: 1, cy: 1 })
    });
```

As you test the mini-game below, be sure to try to make the hero collide with
both arrows.  Since they have no role, they both get the `Passive` role, which
means the hero won't collide with them.  Because of the rules about Z, the hero
will seem to go over one, and under the other.

<iframe src="./game_05.iframe.html"></iframe>
