## Filters That Change

So far, our filters have just wrapped a Pixi filter, without doing anything
fancy.  Let's make a "noise" filter next:

```typescript
{{#include filters.ts:80:98}}
```

In this filter, our `preRender()` will re-randomize the noise each time it is
called.  If we didn't do this, the noise would be the same all the time.  When
you get to the next part of the chapter and try this out, be sure to comment out
that line and watch how things change.

Next, let's create filters for fading in and out:

```typescript
{{#include filters.ts:100:157}}
```

Just for fun, I've shown two different ways to make an "all black" color overlay
filter.  In the first case, I'm specifying the red/green/blue values as an
array, and in the second, I'm using a hex number to represent the color.  Both
do the same thing.  But in the first case, the filter is initially 100%
transparent, and in the second, it is 100% opaque.  Then, in `preRender()`, I'm
gradually changing the opacity of the filter.  For the `FadeIn` filter, when the
opacity gets to zero, the code disables it, since it's no longer useful.
