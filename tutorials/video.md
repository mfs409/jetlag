# Video Cut Scenes

In this tutorial, we will learn about JetLag's support for video assets.  The
main purpose of video in a game is for cut scenes, so we will look at two ways
to integrate video into a game.

## Getting Started

When you made your `Config` object in previous tutorials, you weren't allowed to
omit any fields... everything was mandatory.  It turns out that in JetLag, there
is also an optional field for listing video assets.  Let's start a new game and
set it up like most of our previous tutorials.  We'll use the `sprites.json` and
`sprites.png` files from before, and we'll also want to have the `enableTilt`
and `boundingBox` functions.  And now you should also add this to your `assets/`
folder:

- [Big Buck Bunny](assets/big_buck_bunny.mp4)

(If you're wondering, this video is a clip from [Big Buck
Bunny](https://en.wikipedia.org/wiki/Big_Buck_Bunny), a royalty-free video that
was originally released in 2008.  It is commonly used for tutorials, video
tests, etc., because of its permissive Creative Commons license.)

Next we can set up our `Config` with an extra line for the `videoNames`:

```typescript
class Config implements JetLagGameConfig {
  pixelMeterRatio = 100;
  screenDimensions = { width: 1600, height: 900 };
  adaptToScreenSize = true;
  canVibrate = true;
  accelerometerMode = AccelerometerMode.DISABLED;
  storageKey = "--no-key--";
  hitBoxes = true;
  resourcePrefix = "./assets/";
  musicNames = [];
  soundNames = [];
  imageNames = ["sprites.json"];
  videoNames = ["big_buck_bunny.mp4"]; // All video names
}
```

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

## Our First Cut Scene

To make a cut scene, all we really need is a `VideoSprite`.  Let's say that level 2 is just a cut scene... there's no gameplay, just a video.  It's tempting to just do this:

```typescript
    let a = new Actor({
      appearance: new VideoSprite({ width: 16, height: 9, vid: "big_buck_bunny.mp4" }),
      rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
    });
```

In fact, this might even work.  When you make a `VideoSprite`, it will try to
automatically start playing.  But there's a catch.  JetLag tries hard not to
have several copies of the same video hanging around.  That means that if you
play a video and don't reset it when you're done, then when you put the video on
another cut scene, it will still be at the end.  So let's just be very explicit:
we'll immediately reset the video and make it start playing:

```typescript
    (a.appearance[0] as VideoSprite).reset();
    (a.appearance[0] as VideoSprite).play();
```

At this point, your video will play, but when it reaches the end, nothing
happens.  "End-of-video-playback" is an event, so we can give JetLag some code
to run when the video ends.  In this case, we'll just go to the second level:

```typescript
    (a.appearance[0] as VideoSprite).onEnd(() => stage.switchTo(builder, 3));
```

## Cut Scenes in Overlays, and Controlling Video Playback

In the third level of the game, we'll have some actual gameplay, and we'll say
that when the level is won, we'll put the cut scene in an overlay.  Let's start
with the gameplay:

```typescript
    // Put a box around our 16x9 screen
    boundingBox();

    // Make a hero who moves via tilt
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 5, cy: 2, radius: .5 }),
      role: new Hero(),
      movement: new TiltMovement(),
    });

    // Make a destination
    new Actor({
      rigidBody: new CircleBody({ cx: 3, cy: 4, radius: .5 }),
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      role: new Destination(),
    });

    // Enable tilt using a helper function that also sets up arrow keys to
    // simulate tilt
    enableTilt(5, 5);

    // There's no losing, but say what to do when the level is won
    stage.score.onWin = { level: 4, builder };
```

Now we'll set up an overlay that will cover the screen when the level is won.
We'll put a `VideoSprite` onto it, but we won't make it full screen:

```typescript
    stage.score.winSceneBuilder = (overlay: Scene) => {
      // Make the video
      let a = new Actor({
        appearance: new VideoSprite({ width: 12, height: 27 / 4, vid: "big_buck_bunny.mp4" }),
        rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }, { scene: overlay }),
      });

      // The video might be at the end.  It might be paused.  Best to reset everything just to be safe:
      (a.appearance[0] as VideoSprite).reset();
      (a.appearance[0] as VideoSprite).play();

      // We'll say that once the video ends, immediately jump to the next level
      (a.appearance[0] as VideoSprite).onEnd(() => {
        stage.clearOverlay();
        stage.switchTo(builder, 4);
      });
    }
```

Now that we've got the overlay in place, let's start putting some buttons on top
of the video, to control video playback.  All of the we'll add to this level
will need to go inside the `winSceneBuilder`:

First, we'll add a button for pausing and un-pausing the video.  We'll use a
local variable (`playing`) to keep track of whether the video is paused or not,
and when we toggle play/pause, we'll also change the button's image:

```typescript
      // This button is a toggle between pause and play.  We're using the wrong
      // icon for play, because the `sprites.json` sprite sheet doesn't have a
      // good play image.
      let playing = true;
      new Actor({
        appearance: new ImageSprite({ width: .25, height: .25, img: "pause.png" }),
        rigidBody: new BoxBody({ cx: 8, cy: 7.5, width: .25, height: .25 }, { scene: overlay }),
        gestures: {
          tap: (actor: Actor) => {
            if (playing) {
              playing = false;
              (actor.appearance[0] as ImageSprite).setImage("back_arrow.png");
              (a.appearance[0] as VideoSprite).pause();
            }
            else {
              playing = true;
              (actor.appearance[0] as ImageSprite).setImage("pause.png");
              (a.appearance[0] as VideoSprite).play();
            }
            return true;
          }
        },
      });
```

Next, let's add a button for restarting the video from the beginning.  This is
trickier than it seems, because we might be restarting a video that is playing,
or restarting one that is paused.  In this code, we won't change the state... if
it's playing, it'll start playing from the beginning.  If it's paused, it will
remain paused, but be reset to the start.  If we wanted to be fancier, we'd need
this code to also update the icon of our pause button.

```typescript
      // This button can reset the video.  If it's paused, don't un-pause.  If
      // it's playing, don't pause.
      new Actor({
        appearance: new ImageSprite({ width: .25, height: .25, img: "left_arrow.png" }),
        rigidBody: new BoxBody({ cx: 7.5, cy: 7.5, width: .25, height: .25 }, { scene: overlay }),
        gestures: {
          tap: () => {
            (a.appearance[0] as VideoSprite).reset();
            return true;
          }
        },
      });
```

Finally, we'll add a button for skipping the cut scene entirely.  Again, there's
an unexpected issue here.  If we just switch to a new stage, the cut scene won't
show, but it will keep playing in the background.  This is kind of like what
happens when you have a long sound effect that plays during a level transition.
Since we don't want that, we'll pause the video as part of jumping to the next
level:

```typescript
      new Actor({
        appearance: new ImageSprite({ width: .25, height: .25, img: "right_arrow.png" }),
        rigidBody: new BoxBody({ cx: 8.5, cy: 7.5, width: .25, height: .25 }, { scene: overlay }),
        gestures: {
          tap: () => {
            stage.clearOverlay();
            stage.switchTo(builder, 4);
            (a.appearance[0] as VideoSprite).pause();
            return true;
          }
        },
      });
```

To round out the example, we'll now add a "level 4", so that the cut scene has
somewhere to go.  In this case, we'll just give the player an option for
starting over:

```typescript
  else if (level == 4) {
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: "#000000", size: 24 }, "Start Over"),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }),
      gestures: { tap: () => { stage.switchTo(builder, 1); return true; } }
    });
  }
```

Here's the whole game:

```iframe
{
    "width": 800,
    "height": 450,
    "src": "video.html"
}
```

## Wrapping up

Getting a cut scene into your game is usually not too difficult.  The biggest
challenge is thinking about how your players will feel about it.  It's probably
a good idea to make it possible to skip cut scenes, and also to re-play them,
especially if they involve important clues or plot elements.

```md-config
page-title = Video Cut Scenes
img {display: block; margin: auto; max-width: 75%;}
.max500 img {max-width: 500px}
.red {color: red}
```
