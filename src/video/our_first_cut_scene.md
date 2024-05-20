## Our First Cut Scene

To make a cut scene, all we really need is a `VideoSprite`.  Let's say that
level 2 is just a cut scene... there's no gameplay, just a video.  It's tempting
to just do this:

```typescript
{{#include game.ts:47:50}}
```

In fact, this might even work.  When you make a `VideoSprite`, it will try to
automatically start playing.  But there's a catch.  JetLag tries hard not to
have several copies of the same video hanging around.  That means that if you
play a video and don't reset it when you're done, then when you put the video on
another cut scene, it will still be at the end.  So let's just be very explicit:
we'll immediately reset the video and make it start playing:

```typescript
{{#include game.ts:51:52}}
```

At this point, your video will play, but when it reaches the end, nothing
happens.  "End-of-video-playback" is an event, so we can give JetLag some code
to run when the video ends.  In this case, we'll just go to the third level:

```typescript
{{#include game.ts:53}}
```
