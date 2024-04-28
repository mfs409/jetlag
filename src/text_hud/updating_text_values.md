## Updating Text Values

In our previous example, the text that appeared on each actor did not change.
Let's try to make a button that announces how many times it has been tapped:

```typescript
    let tap_count = 0;
    new Actor({
      rigidBody: new BoxBody({ cx: 1, cy: 1, width: .5, height: .5 }),
      appearance: new TextSprite({ center: true, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 }, "Taps: " + tap_count),
      gestures: { tap: () => { console.log("tap"); tap_count += 1; return true; } }
    });
```

Unfortunately, this does not work!  No matter how often we tap, the text always
says "Taps: 0":

<iframe src="./game_03.iframe.html"></iframe>

The problem here is that we weren't thinking about *when code runs*. `builder()`
is a function that runs *before* the level starts being playable. In our code
above, we explained how to put text on the screen by reading the value of
`tap_count`, combining it with the text "Taps: ", and then putting that text
into an actor on the screen.  So, in essence, we *read* `tap_count` once, while
it was zero, and used that value for the rest of time.

Instead of providing fixed text (indicated by `""`), we can provide a function
that can be run every time the screen updates.  This lets us re-compute the text
all the time, so that it will always show the latest value.  Let's try it out:

```typescript
    let tap_count = 0;
    new Actor({
      rigidBody: new BoxBody({ cx: 1, cy: 1, width: .5, height: .5 }),
      appearance: new TextSprite(
        { center: true, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 },
        () => "Taps: " + tap_count),
      gestures: { tap: () => { tap_count += 1; return true; } }
    });
```

With this change, the text should now update every time you tap its rigid body.

<iframe src="./game_04.iframe.html"></iframe>
