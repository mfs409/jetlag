# Styles of Movement

This tutorial relates the discussion of physics to the Movement field in
the constructor for Actors.

If you finished the Rigid Body tutorial, you've got a good foundation for this
tutorial.  While there's lots more we can explore in the configuration of rigid
bodies, having some better ways of moving the hero would make it easier for us
to do such an exploration, so let's switch gears and start looking at ways to
move an actor. We've already seen Tilt, which is nice and straightforward.
We've also seen "Inert", the default movement policy.

To get started, you should reset your `game.ts` file so that `builder()` has no
code in it.  This tutorial is going to use the `boundingBox()` and
`enableTilt()` functions, so you'll want to copy them over.  You'll also want to
use the same `png` files as in the Rigid Body tutorial.
