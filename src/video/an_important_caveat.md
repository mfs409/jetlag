## An Important Caveat

Web browsers normally refuse to play video or audio until there is a gesture on
the page.  If your game is running as a mobile or desktop app, this rule may not
apply. But when running in a browser, you can't start playing a video until
there is *some* gesture.

If you think about it, this is a good rule... it prevents new tabs from
auto-playing in the background!  And it's not really a big deal for a *real*
game... in any real game, you probably start with a menu, and it's not until the
player taps or clicks something on the page that the game will start... and you
almost never have a cut scene before that first gesture.

However, in this tutorial, we aren't going to build a whole game.  So to work
around this browser issue, we'll make our first as a button that takes us to
level 2.  In that way, we have a gesture on the page, so all subsequent video
behaviors will work.

Here's the code for level 1: it's just a full-screen body with some text on it:

```typescript
  if (level == 1) {
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: "#000000", size: 24 }, "Press Me"),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }),
      gestures: { tap: () => { stage.switchTo(builder, 2); return true; } }
    });
  }
```

