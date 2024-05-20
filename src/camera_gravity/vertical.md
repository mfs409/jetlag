## A Vertical Perspective

For the last game in this chapter, we'll make the start of a doodle jump-like
game.  In the live demo below, you can use arrows to move left/right, and the
space bar to jump.

<iframe src="./game_04.iframe.html"></iframe>

This game requires the following assets:

- [green_ball.png](camera_gravity/green_ball.png)
- [mustard_ball.png](camera_gravity/mustard_ball.png)
- [night_0.png](camera_gravity/night_0.png)
- [night_1.png](camera_gravity/night_1.png)

After you've downloaded them to your `assets` folder, re-set your `game.ts` file
to look like [this](../empty/game.ts). Then add this line in your `Config`
object:

```typescript
{{#include game_04.ts:11:14}}
```

We'll start by setting up gravity and camera bounds:

```typescript
{{#include game_04.ts:26:28}}
```

The arguments to `camera.setBounds` should seem a bit strange.  Up until now,
our games all had the coordinate (0, 0) in the top-right corner.  Moving down
meant bigger Y values, and moving right meant bigger X values.  But now we want
a game that goes *upward*.  The bottom of the default game has a Y of 9... so
that should be the maximum Y.  Since we don't want any left/right scrolling, the
minimum X should be 0, and the maximum X should be 16.  That leaves the minimum
Y.  Our game is going to move up and up, forever, into bigger and bigger
**negative** Y values.  By saying that the *lower* bound is `undefined`, the
camera will go as far up as the hero goes.

Next, let's put a floor into the world.  Notice that the floor is outside of the
camera range, because its Y is centered at 9.05 and its height is .1.  That
means it goes from 9.0 to 9.1 in the Y dimension, which is completely below the
maximum Y value we just established for the camera.  We make the floor an
`Obstacle`, so that the hero will be able to stand on it.

```typescript
{{#include game_04.ts:30:35}}
```

Next, we'll set up tilt, create a hero, tell the camera to follow the hero, and
set up the space bar to make the hero jump:

```typescript
{{#include game_04.ts:37:57}}
```

You might have noticed that the call to `setCameraFocus` has two extra
arguments.  By providing `x=0` and `y=-2`, we're indicating that we want the
camera to focus on a point that is 2 meters *above* the hero.  This will make it
easier to see more of the screen while playing.

Note, too, that we didn't use the `enableTilt` function that we wrote earlier.
That's because we only want tilt for left/right.

Lastly, we set the space bar to make the hero `jump`.  There is a rather
complicated concept here: if we just added a negative Y velocity to the hero,
how could we know when the hero could jump again?  Our game kind of requires the
hero to only jump after landing on a platform.  Fortunately, in JetLag, we can
use the `Hero.jump` to give an upward velocity, and JetLag will not let the hero
jump again until after it collides with an Obstacle.  That gets us the desired
condition for when the hero can jump again.

If you just tried moving left or right, soon the hero would go off screen and
never come back, because it would walk off of the floor we made.  To address the
problem, let's put some enemies off screen.  Since there's a way to lose, we
need to tell JetLag to restart this level if the hero collides with an enemy and
"loses" the level.

```typescript
{{#include game_04.ts:59:75}}
```

Next, let's provide a way to win, by putting a destination very high up in the
sky.  Remember that "high" means "negative y".

```typescript
{{#include game_04.ts:77:84}}
```

We need a way for the hero to get up to that destination.  Let's make a function
that can make obstacles (platforms).  You can put this function *inside* the
`builder` function.

```typescript
{{#include game_04.ts:86:94}}
```

In this function, we make an actor at the `cx, cy` coordinates that were
provided to it.  Notice how we don't need to say `{cx: cx, cy: cy}`.  TypeScript
has a nice shorthand when the value on the left side of a `:` has the same name
as is expected on the left side.

These obstacles have two new features.  The first is that they use
`singleRigidSide`, which means that an actor can only collide with the obstacle
by falling down onto it.  Actors, like the hero, can jump upward and pass
through the obstacle.  Second, we've provided an optional `heroCollision` code
for the Obstacle role.  This says that when a hero collides with the platform,
it should get a tiny upward jolt, to make it seem like it is bouncing.

Now we can use our function to make a bunch of platforms, each higher than the
last:

```typescript
{{#include game_04.ts:96:105}}
```

The last thing we'll do is make the background more interesting.  We saw before
that it's possible to use an image for the background.  We can also *animate*
images, by flipping between them rapidly.

```typescript
{{#include game_04.ts:107:110}}
```

Animations are a complex topic, and there is a whole chapter devoted to them.
For now, all we really need to understand is that we made an AnimationSequence
that spends 550 milliseconds on each of its two images, and loops.  Then we used
a "map" to associate it with the "IDLE_E" state, which is the default state (it
means "facing to the east, not moving", but that's not really important right
now).

But we also didn't exactly make an *Actor* here.  Instead, we provided code for
making AnimatedSprites from that map, and we used it to tell the stage's
background system to tile the image vertically, so that the infinite level would
generate its infinite tiles of background on demand.  We also gave it a speed of
0.3, which means that it moves more slowly than the hero.  This is known as a
"Parallax" background, and it gives a nice sense of depth.

Here is the [code for the whole game](game_04.ts).  Before you go on to the next
chapter, be sure to play around with it.  Try changing some values, adding
platforms, and moving things around.
