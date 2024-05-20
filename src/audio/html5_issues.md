## HTML5 Issues

Since JetLag is based on web technologies (HTML5, JavaScript, CSS), it is
subject to some rules that relate to web browsers.  The most important of these
is that a web page can't start playing sounds until there is some gesture on the
page.

In addition, it's a good idea to have a way to let the person playing your game
mute and un-mute the game.  Putting both of these ideas together, it's going to
be useful to have a function like this (from [common.ts](common.ts)), for drawing a button that mutes/unmutes.

```typescript
{{#include common.ts:78:112}}
```

This function is using "persistent storage", which we discuss in the Storage
chapter, to save the user's choice about muting.  That can help to make sure
that when they refresh the page, the old selection remains.

It is also using a "tap" gesture to switch the mute state between 0 and 1.  In
JetLag, volume is a decimal between 0 and 1, so we're effectively turning it all
the way up, or all the way down.

One last note before we move on: this function requires that you put
`sprites.json` in your `imageNames`, so that the two images are available.  Even
better would be for you to make your own images.  They'll almost certainly look
better than mine!