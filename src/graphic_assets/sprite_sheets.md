## Sprite Sheets

Typing all your file names into the `imageNames` array is tedious and error
prone.  It also happens to be slow.  The problem is that JetLag needs to fetch
these images one at a time.  Fortunately, there are tools like
[TexturePacker](https://www.codeandweb.com/texturepacker).  With TexturePacker,
you can turn a bunch of small images into a single big image.  TexturePacker
also will give you a `.json` file that JetLag (via Pixi.js) can use to decipher
that big image into all of its parts.  Let's try it out.  Remove
`green_ball.png` from your `imageNames`.  Then download these two files into
your `assets`` folder:

- [sprites.png](graphic_assets/sprites.png)
- [sprites.json](graphic_assets/sprites.json)

Be sure to open both files to see what they look like.  The .png file has a
bunch of images packed together.  The .json file tells Pixi.js (and hence
JetLag) how to extract those images from the file.

We load spritesheets just like we load other images in our `Config` object:

```typescript
{{#include game_04.ts:7:16}}
```

Then our code can use the image names, just like before:

```typescript
{{#include game_04.ts:30:33}}
```

And the result is exactly what we'd expect:

<iframe src="./game_04.iframe.html"></iframe>

You can find the code for this example [here](game_04.ts).  Before moving on,
you should take a moment to try to use some of the *other* images from the
spritesheet.
