## Updating Text Values

In our previous example, the text that appeared on each actor did not change.
Let's try to make a button that announces how many times it has been tapped:

```typescript
{{#include game_03.ts:23:28}}
```

Unfortunately, this does not work!  No matter how often we tap, the text always
says "Taps: 0".  Here's the [code](game_03.ts), and here's what it looks like
when we try to play it:

<iframe src="./game_03.iframe.html"></iframe>

The problem here is that we weren't thinking about *when code runs*. `builder()`
is a function that runs *before* the level starts being playable. In our code
above, we explained how to put text on the screen by reading the value of
`tap_count`, combining it with the text "Taps: ", and then putting that text
into an actor on the screen.  So, in essence, we *read* `tap_count` once, while
it was zero, and used that value for the rest of time.

You can convince yourself of this by opening the developer console and watching
how the code is, in fact, running.  Every time you tap the text, a new message
is being printed.

Instead of providing fixed text (indicated by `""`), we can provide a function
that can be run every time the screen updates.  This lets us re-compute the text
all the time, so that it will always show the latest value.  Let's [try it out](game_04.ts):

```typescript
{{#include game_04.ts:23:30}}
```

With this change, the text should now update every time you tap its rigid body.

<iframe src="./game_04.iframe.html"></iframe>
