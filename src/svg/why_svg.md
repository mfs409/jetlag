## Why SVG?

SVG files are a compact way to represent a shape as a series of lines.  In
truth, SVG files can be used for much more than just this, but in 2D games, they
are often used in a simple way: as a convenient way to represent a complex
shape.  Part of the reason SVG is so nice is that it represents the shape as
lines, so as you zoom in or out, there is never any blurring.  This is known as
a "vector" format, instead of a "pixel" format, like PNG.

There are some challenges when using SVGs, though.  For one, the SVG format
allows embedding images, which is not useful to us.  It also has its own notion
of shapes, including circles and curves.  Again, that's not going to be of much
use in our game.  When you use a tool like InkScape to make SVGs for your game,
you probably just want to limit yourself to drawing a single shape, using the
"straight line" tool.

This may seem like a huge simplification... what's the big deal?  If we make a
shape using SVG, it's easy to visualize it before writing any code.  If we ask
JetLag to make a bunch of rectangles, representing the lines of the shape, and
then we find that they don't work, we can just re-draw the shape (or edit it),
re-load it, and see if that makes things better.  As an example, imagine a
racing game with a side view.  By using svg files to represent the ground, you
could draw dozens of "levels", each with a different configuration of hills,
valleys, ramps, and straightaways.  This can save *lots* of time over drawing
the terrain by writing code.
