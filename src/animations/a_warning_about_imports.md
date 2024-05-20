## A Warning About Imports

In this chapter, we will use the `AnimatedSprite` type.  Unfortunately, both
JetLag and Pixi.js have something that they call an `AnimatedSprite`.  If you
are using a plug-in to manage your imports, or if you are letting VSCode
automatically create import statements for you, make sure it imports the correct
import: `import { AnimatedSprite } from "../jetlag";`.

(Note: the statement might include other things in the import, so if you see
something like `import { AnimatedSprite, FilledBox, FilledCircle, FilledPolygon,
ImageSprite } from "../jetlag";`, that's fine too.  The
thing you don't want is this: ~~`import { AnimatedSprite } from "pixi.js";`~~
