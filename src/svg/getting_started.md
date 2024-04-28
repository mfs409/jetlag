## Getting Started

This tutorial will just draw an ugly SVG shape in the middle of the world.  It
will also put a hero on the screen who can move around and bounce into the
shape.  To get this to work, you'll need the `enableTilt()` and `boundingBox()`
functions, as well as the `sprites.json`/`sprites.png` sprite sheet.

You will also need an SVG file.  You can download this one, and put it in your
`assets` folder:

- [shape.svg](svg/shape.svg)

@@red Do *not* add `shape.svg` to your `imageNames`... it works a little bit
differently.@@

Lastly, VSCode might have trouble locating the `SvgSystem`, which we use to draw
shapes based on the lines in an SVG file.  If you are having trouble, try adding
this `import` statement:

```typescript
import { SvgSystem } from "../jetlag/Systems/Svg";
```
