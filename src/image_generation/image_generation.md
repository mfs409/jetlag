# Image Generation

When you start making games, there comes a point where you find yourself looking
at *other* games and thinking "how did they do that?"  Filters are one such
example (and if you compare flashlights in a game like StarDew Valley with
flashlights in Among Us, you'll realize that some flashlights are much more
complicated than others).  Another is character creation.

Have you ever played a game where you could endlessly customize the character's
color, clothing, body type, hair style, etc.?  Clearly the programmers and
artists did not make every possible color combination and clothing combination.
As you may have guessed, filters provide a way to change colors, so they must
have something to do with this.  But what about the rest of the character's
body?  Is it really the case that the character needs a half dozen different
animated image components, all moving around together?  That seems like it would
be very complex!

In this chapter, we explore another way: we can use Pixi.js to *flatten* several
images into a single image.  Combining this with filters, we can move toward
being able to build a custom player on the fly.
