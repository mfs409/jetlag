## Do-It-Yourself Sound Effects

The above events are not the only reason to have sounds, of course.  Sometimes
you'll want sound effects to happen on a timer or gesture.  In the [following
game](game_16.ts), tapping on the different colored boxes will produce different
sounds:

<iframe src="./game_16.iframe.html"></iframe>

In this game, we use `stage.musicLibrary.getSound()` to get sound effects.  Once
we have one, we can call four methods on it:

- `play()`: start playing the sound.
- `stop()`: stop playing the sound.  Trying to `play` again will start from the
  beginning.
- `pause()`: pause the sound.  Trying to `play` again will resume from the point where the sound was paused.
- `playing()`: Check if the sound is playing.

Let's test these out.  First, we'll draw a mute button:

```typescript
{{#include game_16.ts:34}}
```

Next, we'll draw the dark blue button:

```typescript
{{#include game_16.ts:36:42}}
```

As the comment in the code suggests, tapping this code at a high frequency will
lead to the sound playing repeatedly, overlaying on top of itself.

Next, let's use `playing()` to only play the sound if it's not already playing:

```typescript
{{#include game_16.ts:44:56}}
```

You might notice that when you tap the dark blue button, the cyan button won't
work until all instances of the sound are done playing.  We'll work on that in a
moment.  First, let's add buttons for stopping and pausing:

```typescript
{{#include game_16.ts:58:86}}
```

Hopefully you are in the habit of trying to break things or make them misbehave.
In this case, you'll find that if you hit the dark blue button repeatedly, then
the green button, all the sounds stop.  If you hit the dark blue button
repeatedly, then the magenta button, they all pause, but only one of them can be
resumed.  That's probably not quite what you'd like to have happen.  And
similarly, we saw that `playing()` didn't quite work the way we want.  Our
yellow button will point you toward how to solve these problems:

```typescript
{{#include game_16.ts:88:102}}
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
