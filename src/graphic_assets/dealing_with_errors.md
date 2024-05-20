## Dealing With Errors

If you enter a name incorrectly, JetLag should print an error to the console and
stop running.  For example, try replacing `noise.png` with `bird.png`, resulting in this code:

```typescript
{{#include game_03.ts}}
```

You should see an error message in your developer console (remember: press `F12`
to open the developer console), probably something like "Uncaught (in promise)
Unable to find graphics asset 'bird.png'.

<iframe src="./game_03.iframe.html"></iframe>

If you type a name incorrectly in your `imageNames` array, you'll get a
different (and less helpful) error message.  Be sure to try it before moving
forward in this chapter.
