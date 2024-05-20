## Getting Started

By now, you've probably noticed that there are many fields of the `Config`
object that you can usually skip when your game doesn't need them.  Video is
another one of those fields.  Let's start a new game and set it up like most of
our previous chapters.  We'll use the `sprites.json` and `sprites.png` files
from before, and we'll also want to have the `common.ts` file.And now you should
also add this to your `assets/` folder:

- [Big Buck Bunny](assets/big_buck_bunny.mp4)

(If you're wondering, this video is a clip from [Big Buck
Bunny](https://en.wikipedia.org/wiki/Big_Buck_Bunny), a royalty-free video that
was originally released in 2008.  It is commonly used for chapters, video
tests, etc., because of its permissive Creative Commons license.)

Next we can set up our `Config` with an extra line for the `videoNames`:

```typescript
{{#include game.ts:4:17}}
```
