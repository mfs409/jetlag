## Changing Images On The Fly

We can change the ImageSprite's underlying image on the fly.  This is not the
same as animation, but it can be useful.  In this example, we'll change the
hero's image according to its strength.  We'll do this by having goodies that
increase the hero strength.  Here's the [game](game_06.ts):

<iframe src="./game_06.iframe.html"></iframe>

We'll start by setting up the gravity and making a hero who can move via tilt:

```typescript
{{#include game_06.ts:25:34}}
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
idea more in another chapter.

Also, notice that I am computing the name of the image based n the hero's
strength.  The different `color_star_X.png` images are part of our
`sprites.json` file.

```typescript
{{#include game_06.ts:35:39}}
```

Finally, we'll add four goodies, each of which uses this `onCollect` function.
There's a nice simplification when writing this code.  If we had named the
function `changeHeroImageBasedOnStrength`, then our role would need to be `new
Goodie({onCollect: changeHeroImageBasedOnStrength})`.  But when the name of the
field on the right side of the `:` and the name of the value on the left side
are the same, we can just write it once:

```typescript
{{#include game_06.ts:40:59}}
```

(Note: if you absolutely must have an "invisible" image at some point, you can use `""` as the `img` value.  This is the one situation in which JetLag won't complain that an image name cannot be found.)
