## Exploring Appearance Concepts With Filled Sprites

JetLag draws some connections between an actor's appearance and its rigid body.
When the rigid body moves, the appearance moves with it, so that the centers of
the two are the same.  Similarly, when an actor's rigid body rotates, the
appearance rotates too.  Beyond that, there isn't much of a link.  We've already
seen this a bit... The rigid body shape does not need to match the shape of the
appearance component, and the rigid body size does not need to match the size of
the appearance component.  We can see this in the following mini-game, where the
box and circle don't have the same dimensions as their rigid bodies:

<iframe src="./game_01.iframe.html"></iframe>

The code for this level should not be too much of a surprise... we make three
actors, give each a rigid body, and give each an appearance:

```typescript
    // A circle.  It is filled red.  It has a green outline.  The body has a
    // bigger radius
    new Actor({
      appearance: new FilledCircle({ radius: .5, fillColor: "#ff0000", lineWidth: 4, lineColor: "#00ff00" }),
      rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
    })

    // A rectangle.  It is filled blue.  It has no outline.  The body has a
    // smaller perimeter and different shape
    new Actor({
      rigidBody: new BoxBody({ cx: 3, cy: 4, width: 2, height: 2 }),
      appearance: new FilledBox({ width: 1, height: .5, fillColor: "#0000ff" }),
    })

    // A polygon.  The fourth color channel is "alpha", and 00 means
    // "transparent", even though it looks like it should be red.
    new Actor({
      rigidBody: new PolygonBody({ cx: 10, cy: 5, vertices: [0, -.5, .5, 0, 0, .5, -1, 0] }),
      appearance: new FilledPolygon({ vertices: [0, -.5, .5, 0, 0, .5, -1, 0], fillColor: "#ff000000", lineWidth: 4, lineColor: "#00ff00" }),
    })
```

It's good to just review a few things.  First, pretty much everything in JetLag
is an Actor, and every actor has an "appearance" component.  There are three
kinds of appearance components: ImageSprite, AnimatedSprite, and filled shapes.
There are three kinds of filled shapes, which we see here.

Filled shapes (and all colors in JetLag, for that matter) are described in terms
of red, green, and blue.  Each part is two characters, with each character being
in the range [0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F]. Capitalization doesn't matter.
So the color #DECC02 has a red of DE, a green of CC, and a blue of 02.  You can
learn more at [w3 schools](https://www.w3schools.com/colors/colors_picker.asp).
Also, note that a fourth pair of numbers is optional, representing transparency
(an "alpha" channel).  00 means fully transparent, FF means not at all
transparent, and anything in between is partly transparent.  Transparent circles
and boxes are the least expensive appearances for JetLag to manage, so if you're
not sure what to use, these are a good choice.

Also, notice that since "transparent" is a possibility, every filled shape must
have a color.  Assigning an outline is optional, so if you want an outline, with
no fill, just use transparency.
