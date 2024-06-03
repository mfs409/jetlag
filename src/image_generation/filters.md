## Adding More Textures, And Applying Filters

Next, let's add the rest of the textures.  We'll start with the legs, then feet,
then head, nose, and mouth.  We need to be careful with the order for these,
because the order they go into the container will determine which images will be
on top of others as they are merged.  For our nose and mouth, which are just
lines, we need them to be on top of the head, or we won't be able to see them.
As you write the code that appears below, make sure it is *after* the body is
added to the container, but *before* the container gets turned into a `Texture`.

```typescript
{{#include game.ts:33:43}}
```

We have two more textures to add, but we need to do them a bit more carefully,
because we want to apply filters to them to change their colors.  Above, we made
a texture, turned the texture into a `PixiSprite`, and then added the
`PixiSprite` to the container.  Now, we're going to want to do the same, but
Pixi filters are supposed to be attached to Sprites, not Textures.  That means
we'll need to create the sprite, attach a filter, then add it to the container.

The two most common ways to re-color are by using a `ColorReplaceFilter` or
using an `HslAdjustmentFilter`.  In this code, I show both ways.  First, we make
the sprite for the eyes, and use a color replace filter to replace the `#FF0000`
color (bright red) that I used for the pupils.  We'll replace it with a brownish
color.  In this case, `ColorReplaceFilter` asks that the red/green/blue values
are provided as decimals in the range from 0 to 1.  So instead of putting in
`255, 0, 0`, we divide each by 255 to translate those numbers into the right
range.  Also, notice that there is a tolerance value, which we make very small
so that other colors aren't accidentally turned to brown.

```typescript
{{#include game.ts:44:47}}
```

Next, we will add the hair.  First, I had to pick a hair style.  My spritesheet
has three options, `hair_01.png`, `hair_02.png`, and `hair_03.png`.  I chose the
first.  This time, I'm using an `HslAdjustmentFilter` to color it.
`HslAdjustmentFilter` works more nicely for tinting, instead of directly
replacing specific colors.  We can't really see the difference in this game,
because we're simply tinting "white" to another color, but if you have more
complex graphics, `HslAdjustmentFilter` is probably what you'll want to use.

The `HslAdjustmentFilter` works with colors in a different format than
red/green/blue.  Instead, it uses "hue" (a number between -180 degrees and 180
degrees), "saturation" (a value between -1 and 1), and "lightness" (also between
-1 and 1).  There is some wonderful theory behind how this works, but the easy
answer is that there are on-line converters between RGB and HSL.

```typescript
{{#include game.ts:48:51}}
```

When you run the code, you'll see that we've merged all the images into a single
Texture, so now JetLag has much less work to do.  All of the merging and
filtering was one once, when we made the character.  As it moves around, there
is no work to be done in re-coloring or moving multiple sprites.
