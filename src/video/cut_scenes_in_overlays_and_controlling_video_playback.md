## Cut Scenes in Overlays, and Controlling Video Playback

In the third level of the game, we'll have some actual gameplay, and we'll say
that when the level is won, we'll put the cut scene in an overlay.  Let's start
with the gameplay:

```typescript
{{#include game.ts:56:84}}
```

Now we'll set up an overlay that will cover the screen when the level is won.
We'll put a `VideoSprite` onto it, but we won't make it full screen:

```typescript
{{#include game.ts:86:95}}
```

Now that we've got the overlay in place, let's start putting some buttons on top
of the video, to control video playback.  All of the code we'll add to this
level will need to go inside the `winSceneBuilder`:

First, we'll add a button for pausing and un-pausing the video.  We'll use a
local variable (`playing`) to keep track of whether the video is paused or not,
and when we toggle play/pause, we'll also change the button's image:

```typescript
{{#include game.ts:112:134}}
```

Next, let's add a button for restarting the video.

```typescript
{{#include game.ts:99:110}}
```

Finally, we'll add a button for skipping the cut scene entirely.  Again, there's
an unexpected issue here.  If we just switch to a new stage, the cut scene won't
show, but it will keep playing in the background.  This is kind of like what
happens when you have a long sound effect that plays during a level transition.
Since we don't want that, we'll pause the video as part of jumping to the next
level:

```typescript
{{#include game.ts:136:157}}
```

To round out the example, we'll now add a "level 4", so that the cut scene has
somewhere to go.  In this case, we'll just give the player an option for
starting over:

```typescript
{{#include game.ts:161:167}}
```

Here's the [whole game](game.ts):

<iframe src="./game.iframe.html"></iframe>
