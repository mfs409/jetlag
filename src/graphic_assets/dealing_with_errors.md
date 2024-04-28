## Dealing With Errors

If you enter a name incorrectly, JetLag should print an error to the console and
stop running.  For example, try replacing `noise.png` with `bird.png`:

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 2, height: 2, img: "bird.png" }),
      rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
    });
```

You should see an error message in your developer console, probably something
like "Uncaught (in promise) Unable to find graphics asset 'bird.png'.

<iframe src="./game_03.iframe.html"></iframe>

If you type a name incorrectly in your `imageNames` array, you'll get a
different (and less helpful) error message.  Be sure to try it before moving
forward in this tutorial.  @@red Also, please note that spaces in asset names
are almost always a bad idea.  The same is true for special characters like `(`
and `)`.  You should try to only use letters, numbers, and underscore in asset
file names. @@
