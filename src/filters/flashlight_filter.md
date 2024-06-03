## A Flashlight Filter

Next, let's make a flashlight filter.  This is going to be quite different from
what we've done so far.  We'll start by bringing in a new image:

- [radial.png](../assets/radial.png)

This image is a large black rectangle, with a transparent circle in the middle.
The transparency fades, so the exact center is 100% transparent, and it becomes
increasingly less transparent as the distance from the center of the circle
increases, until some point where it becomes completely black.

We can put this on the world, and move it on every frame, so that it is centered
on the hero, and we'll get a nice "flashlight effect".

[Here](game_02.ts) is how it looks:

<iframe src="./game_02.iframe.html"></iframe>

There's one more trick to this code: we'll actually put a filter directly on the
ImageSprite's underlying Pixi image.  This is different from a
`FilterComponent`: it's just a Pixi filter, with nothing fancy attached to it.
In my case, I've added an `AlphaFilter`, to make all of the blackness somewhat
gray and transparent.  It would also be possible to introduce a sort of "sunset
color" filter instead, or a variety of other effects.
