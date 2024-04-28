## Changing Images On The Fly

We can change the ImageSprite's underlying image on the fly.  This is not the
same as animation, but it can be useful.  In this example, we'll change the
hero's image according to its strength.  We'll do this by having goodies that
increase the hero strength.  Here's the mini-game:

<iframe src="./game_06.iframe.html"></iframe>

We'll start by setting up the gravity and making a hero who can move via tilt:

```typescript
    boundingBox();
    stage.world.setGravity(0, 10);
    enableTilt(10, 0);

    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 1 })
    });
```

Since we're going to make several goodies that all have the same `onCollect`
behavior, we will make the `onCollect` function first.  We don't use the goodie
that is passed to it, so we give it a name that starts with an underscore.  As
for the hero, we'll change its appearance by calling `setImage()`.  Note that we
can't give it a `new ImageSprite()`... JetLag doesn't allow that.  Instead, we
change the image used by its existing `ImageSprite`.

In this code, you'll notice that it says `h.appearance[0]`.  That's because
the `appearance` field can actually hold several `AppearanceComponent`
instances.  So far, we've only ever had one, but in JetLag, there's actually
an *array*, so that first component is `appearance[0]`.  We'll explore this
idea more in another tutorial.

Also, notice that I am computing the name of the image based n the hero's
strength.  The different `color_star_X.png` images are part of our
`sprites.json` file.

```typescript
    let onCollect = (_g: Actor, h: Actor) => {
      let s = ++(h.role as Hero).strength;
      (h.appearance[0] as ImageSprite).setImage("color_star_" + s + ".png");
      return true;
    }
```

Finally, we'll add four goodies, each of which uses this `onCollect` function.
There's a nice simplification when writing this code.  If we had named the
function `changeHeroImageBasedOnStrength`, then our role would need to be `new
Goodie({onCollect: changeHeroImageBasedOnStrength})`.  But when the name of the
field on the right side of the `:` and the name of the value on the left side
are the same, we can just write it once:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 6.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 6.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect }),
    });
```

(Note: if you absolutely must have an "invisible" image at some point, you can use `""` as the `img` value.  This is the one situation in which JetLag won't complain that an image name cannot be found.)
