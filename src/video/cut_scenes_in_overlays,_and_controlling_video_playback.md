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

<iframe src="./game_01.iframe.html"></iframe>
