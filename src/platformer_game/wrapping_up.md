## Wrapping Up

This example highlights something very important: you should try to develop your
images and assets simultaneously.  Since I made the images first, and then the
game, I didn't realize that crawl rotation was not going to work nicely with my
images.  It's only by designing the story, code, and assets together that you'll
be able to achieve a cohesive experience.  You should also make sure to
periodically test your game (without hitboxes!) to be sure that things look and
feel the way you want.  A nice little trick is to add the line
`stage.renderer.suppressHitBoxes = true;` in the code for a level, as a way to
turn off hitboxes just for that level.

