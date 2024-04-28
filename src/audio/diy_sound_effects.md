## Do-It-Yourself Sound Effects

The above events are not the only reason to have sounds, of course.  Sometimes
you'll want sound effects to happen on a timer or gesture.  In the following
game, tapping on the different colored boxes will produce different sounds:

<iframe src="./game_16.iframe.html"></iframe>

In this game, we use `stage.musicLibrary.getSound()` to get sound effects.  Once
we have one, we can call four methods on it:

- `play()`: start playing the sound.
- `stop()`: stop playing the sound.  Trying to `play` again will start from the
  beginning.
- `pause()`: pause the sound.  Trying to `play` again will resume from the point where the sound was paused.
- `playing()`: Check if the sound is playing.

To test these out, clear out your `builder()`, then start by drawing the mute button:

```typescript
    drawMuteButton({ cx: 15.5, cy: 0.5, width: 1, height: 1, scene: stage.hud });
```

Next, we'll draw the dark blue button:

```typescript
    // If you tap this actor repeatedly, it will keep playing new copies of the
    // sound over the old ones:
    new Actor({
      appearance: new FilledBox({ width: .75, height: .75, fillColor: "#0000FF" }),
      rigidBody: new BoxBody({ cx: 1.5, cy: 1.5, width: .75, height: .75 }),
      gestures: { tap: () => { let x = stage.musicLibrary.getSound("lose_sound.ogg").play(); console.log(x); return true; } }
    });
```

As the comment in the code suggests, tapping this code at a high frequency will
lead to the sound playing repeatedly, overlaying on top of itself.

Next, let's use `playing()` to only play the sound if it's not already playing:

```typescript
    // This actor checks if the sound is playing, and won't start a second copy
    // while the first is still playing
    new Actor({
      appearance: new FilledBox({ width: .75, height: .75, fillColor: "#00FFFF" }),
      rigidBody: new BoxBody({ cx: 3.5, cy: 1.5, width: .75, height: .75 }),
      gestures: {
        tap: () => {
          let sound = stage.musicLibrary.getSound("lose_sound.ogg");
          if (!sound.playing()) sound.play();
          return true;
        },
      },
    });
```

You might notice that when you tap the dark blue button, the cyan button won't
work until all instances of the sound are done playing.  We'll work on that in a
moment.  First, let's add buttons for stopping and pausing:

```typescript
    // This actor will stop all copies of the sound if you tap it while the
    // sound is playing
    new Actor({
      appearance: new FilledBox({ width: .75, height: .75, fillColor: "#00FF00" }),
      rigidBody: new BoxBody({ cx: 5.5, cy: 1.5, width: .75, height: .75 }),
      gestures: {
        tap: () => {
          let sound = stage.musicLibrary.getSound("lose_sound.ogg");
          if (sound.playing()) sound.stop();
          else sound.play();
          return true;
        },
      },
    });


    // This actor will pause all copies of the sound if you tap it while the
    // sound is playing
    new Actor({
      appearance: new FilledBox({ width: .75, height: .75, fillColor: "#FF00FF" }),
      rigidBody: new BoxBody({ cx: 7.5, cy: 1.5, width: .75, height: .75 }),
      gestures: {
        tap: () => {
          let sound = stage.musicLibrary.getSound("lose_sound.ogg");
          if (sound.playing()) sound.pause();
          else sound.play();
          return true;
        },
      },
    });
```

Hopefully you are in the habit of trying to break things or make them misbehave.
In this case, you'll find that if you hit the dark blue button repeatedly, then
the green button, all the sounds stop.  If you hit the dark blue button
repeatedly, then the magenta button, they all pause, but only one of them can be
resumed.  That's probably not quite what you'd like to have happen.  And
similarly, we saw that `playing()` didn't quite work the way we want.  Our
yellow button will point you toward how to solve these problems:

```typescript
    // This actor uses its extra to keep track of the ID of the sound, and only
    // manages its own sound
    new Actor({
      appearance: new FilledBox({ width: .75, height: .75, fillColor: "#FFFF00" }),
      rigidBody: new BoxBody({ cx: 9.5, cy: 1.5, width: .75, height: .75 }),
      gestures: {
        tap: (a: Actor) => {
          let sound = stage.musicLibrary.getSound("lose_sound.ogg");
          if (sound.playing(a.extra.soundId)) sound.pause(a.extra.soundId);
          else a.extra.soundId = sound.play();
          return true;
        },
      },
      extra: { soundId: -1 } // -1 is smaller than any value returned by play()
    });
```

There are three important aspects to this code.  The first is that `play()`
actually returns a number.  In fact, each time you call `play()`, it returns a
new number.  The second is that `pause()`, `stop()`, and `playing()` can
*optionally* take a number as an argument.  That means that we can associate a
specific `play()` with a subsequent `pause()` or `stop()` or `playing()` by
saving the number that `play()` returned, and passing it to the other function.
Third, we're now using the `extra` field of the actor as a place to store the
result of a call to `play()`.  In this way, we can press any button, then press
the yellow button twice, and the yellow button will only affect its sound.  Of
course, the green and magenta buttons can still stop the yellow button's sound,
and the yellow button still inhibits the cyan button from starting a sound.  A
good rule of thumb is "if you are going to use the number returned by `play()`
in one place, you probably need to use the number returned by `play()` in every
place that uses the same sound file."
