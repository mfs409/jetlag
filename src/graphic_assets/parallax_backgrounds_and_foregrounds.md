## Parallax Backgrounds and Foregrounds

Parallax backgrounds and foregrounds are the only situations in which an
appearance is not associated with a rigid body.  They are also the only times
that a filled shape or `TextSprite` cannot be used in place of an `ImageSprite`
or `AnimatedSprite`.

These backgrounds and foregrounds give the appearance of depth, by scrolling at
different speeds.  Begin by downloading these two files and adding them to your
game's `imageNames`:

- [back.png](graphic_assets/back.png)
- [mid.png](graphic_assets/mid.png)

In our example, we'll only use background layers.  Foreground layers work in
exactly the same way.  Also, we'll only use `ImageSprite`, but once you complete
the chapter on Animations, you'll be able to use `AnimatedSprite` as well.
Here's the mini-game we'll make (and here's the [code](game_07.ts)):

<iframe src="./game_07.iframe.html"></iframe>

We'll use the function for drawing "wide" bounding boxes, which was in [common.ts](common.ts):

```typescript
{{#include common.ts:53:76}}
```

Now we can start putting code in our `builder()`.  To begin, let's set up the shape of the world:

```typescript
{{#include game_07.ts:27:30}}
```

Then we can add an actor who moves via tilt.  The camera will follow this actor:

```typescript
{{#include game_07.ts:31:37}}
```

Since our layers use transparency, we'll put a color in the background:

```typescript
{{#include game_07.ts:38}}
```

Then we can make our layers.  They will be displayed in the order they are made,
and we control their speed.  A speed of 0 means "same as the hero".  You can
think of this as the layer that is closest to the camera.  A speed of 1 means
"seems not to move".  This is usually the most distant background layer.  In
general, you'll probably want your background layers to be drawn in reverse
order of their speed... 0, then .8, then .5, then .2, then .1.  Our example only
has two layers, so this isn't too hard:

```typescript
{{#include game_07.ts:39:52}}
```

Under the hood, JetLag will use the `imageMaker` to make as many copies of the
image as it needs, and it will stretch them according to their width/height.  It
uses the `anchor` as a reference point for where to draw the first image, and
then it makes more, to the left and right, as needed.

There are other options for backgrounds (and foregrounds), including those
that scroll vertically and those that scroll "automatically", even when the
actors aren't moving.  You may have seen some of these in other chapters, so
hopefully now they make more sense!
