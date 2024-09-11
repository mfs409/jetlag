## An Overhead Game Where The World Is Bigger Than The Camera

In our very first game, back in the first chapter, it was possible for the hero
to go off the screen.  The game is reproduced below, just in case you want to
convince yourself that it's a problem:

<iframe src="../overview/game.iframe.html"></iframe>

Let's start thinking about how to handle this problem.  To begin with, let's be
a bit more exact about what we are seeing.  In the game, there is a hero and
there is a camera.  The camera is centered on the point (8, 4.5), which is the
center of a world that starts at (0,0), is 16 meters wide, and is 9 meters high.
The camera has no reason to follow the hero as the hero goes off screen, and the
camera has no way of preventing the hero from going off screen.  Indeed, it
wouldn't even make sense for the camera to be able to limit the hero's
movement... we probably need to use some rigidBodies in the `stage.world` for
that purpose.

To explore this problem in more depth, here's the game we are going to make.  It
is not at all interesting or fun.  It consists of a large world (64x36 meters)
that the hero can navigate.  There is a yellow ball somewhere on the screen that
the hero needs to reach in order to win.

<iframe src="./game_02.iframe.html"></iframe>

There is surprising complexity to this game:

- The world has boundaries
- The camera has boundaries
- The camera tries to keep the hero in view at all times
- We use a png file to put a background on the screen
- Clicking the right half of the screen causes the camera to zoom in
- Clicking the left half of the screen causes the camera to zoom out

Let's get started.  The first thing you should do is clear out your `game.ts`
file, so it looks like it did at the beginning of the "Camera+Gravity" game.
Here's a copy of the file: [game.ts](../empty/game.ts).

We're going to start by setting up our graphics.  You will need to download
these three files and put them in your `assets` folder:

- [noise.png](../assets/noise.png)
- [green_ball.png](../assets/green_ball.png)
- [mustard_ball.png](../assets/mustard_ball.png)

Next, add these lines to your `Config`:

```typescript
{{#include game_02.ts:11:14}}
```

When you run your game, be sure to press `F12` and check the console.  If JetLag
can't find any of these files, it will immediately stop and print an error.

Next, let's add the hero.  Once you save your code, the game should
automatically refresh in your browser, and you should see the green ball.  Since
we haven't configured tilt, the hero isn't going to be able to move yet.

```typescript
{{#include game_02.ts:24:29}}
```

Now is a good time to stop and look at what happens when you mis-type an image
name.  Go ahead and change the text, maybe by capitalizing the "g" in
"green_ball".  You should see an error in the console.  Next, try changing "png"
to "pong".  That will result in a different error message.  

```admonish note
In the console, you may see "Deprecation Warnings" or warnings about the 
"AudioContext".  These
can be ignored
```

Next, let's make it so that our hero can move.  We're going to control the hero
with tilt, and we're going to simulate tilt using the keyboard.  As you work
through this book, you'll discover that we are going to use this same code many
times.  That means it's a good candidate for a function.  So let's make a
function, and put it at the bottom of the file:

```typescript
{{#include game_02.ts:124:144}}
```

This code won't do anything until we call it, so in your `builder()` function,
be sure to add this line:

```typescript
{{#include game_02.ts:31}}
```

Since the hero uses `TiltMovement`, pressing the arrows will automatically cause
tilt to move the hero.  But, of course, this reveals our next problem: the hero
can still go off the screen.  We can fix this problem by requesting that the
camera always follow the hero:

```typescript
{{#include game_02.ts:33:38}}
```

What just happened?  Now it seems like the hero isn't moving!  The problem is
that the camera is staying centered on the hero at all times.  With no
background, it's hard to see that the hero is moving.  We can convince ourselves
that it is moving, though, by opening up the developer console and clicking the
screen as we use the arrow keys.  You should see that the world coordinates are
changing as the hero moves.

Since we want a world that is 64x36 meters, a natural thing to do is to draw
some background images.  We'll use `noise.png` for that purpose:

```typescript
{{#include game_02.ts:40:55}}
```

In the notes for this code, you can see that there are two loops.  Loops let us
do the same thing repeatedly.  In this case, we are using `for` loops, which
means that each has a "loop control variable" (`x` and `y`, respectively), which
changes on each iteration of the loop.  So in the end, this is going to make 16
copies of the "noise.png" image, and line them up in a big 64x36 space.  Note
that we are using `collisionsEnabled: false` and `z:-1` so that our hero won't
bounce off of these actors, and these actors will be behind the hero.

Since we only drew pictures, and didn't make obstacles, it is possible for our
hero to go outside of the boundaries of our nice image.  The next thing we'll do
is draw four thin obstacles that bound the space where we drew those pictures:

```typescript
{{#include game_02.ts:57:77}}
```

You might be getting tired of hearing me say "now we have another problem".  But
notice that each time we added some code, we got *closer* to our goal.  And each
new problem was probably a bit simpler than the one before it.  Our new problem
is that the camera is keeping the hero centered, even when the hero is at the
extreme edges of what we want the world to be.  We can fix this by putting
boundaries on the camera.  As you add the following line, be sure to hover over
the `setBounds` method name so you can see its documentation:

```typescript
{{#include game_02.ts:79:80}}
```

Our "game" isn't going to have any enemies.  Instead, we'll say that you win by
finding the destination.  To do that, we'll put a destination into the world,
indicate that the game is won when one hero reaches that destination, and then
tell JetLag to re-start the level when it is won:

```typescript
{{#include game_02.ts:82:89}}
```

The last thing we'll do in this game is add buttons for zooming in and out.  We
have a small issue when doing this, though.  Where should we put the buttons?
If we put them *in the world*, then they might not be on-screen, depending on
where the camera is focused.

To overcome this issue, JetLag actually runs two physics simulations at all
time.  `stage.world` is the one we've been working with so far.  `stage.hud`
(the heads up display) is a slightly less powerful physics simulation and camera
system.  This HUD is always exactly the size of the camera viewport, so anything
we put on the HUD will always be on screen.

The nicest part is that the HUD is pretty much just like the world... we put
actors on it in the exact same way, but add `{scene: stage.hud}` to tell the
rigidBody not to put itself in `stage.world`.

```typescript
{{#include game_02.ts:91:118}}
```

In the above code, there is one more new feature: a `gestures` component.  This
lets us receive touch and mouse events on an actor, and run code in response to
them.  In this case, we change the effective pixel-to-meter ratio (via the
camera's `scale`) when either button is pressed.  This gives the effect of
zooming in or out.

To be honest, our zoom implementation isn't that great: the numbers 50, 10, 20,
and 200 make sense if you're running on an HD screen, but they don't necessarily
make sense for phones or games that aren't running in full-screen mode.  We
won't worry about that for now... once you gain more skill with game
development, you'll be able to figure out how to work around these kinds of
problems.

Here's the [final code for this game](game_02.ts).  Before moving on to the next
section of the book, be sure to make edits to this game, and see if you can
change its behavior in ways that you like.
