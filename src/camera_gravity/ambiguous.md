## Camera + Gravity: An Ambiguous Perspective

In some games, the perspective can be fluid.  One way to think about this is
that when `stage.world` has gravity of (0, 0), that could either mean that the
perspective is from overhead, or that the game is in outer space and the
perspective is from the side.  In these cases, the way you draw your actors will
probably determine which manner is perceived by the player.  To illustrate the
point, we'll make a game that looks like this:

<iframe src="./game_01.iframe.html"></iframe>

You'll notice right away that the game doesn't give any instructions.  Were you
able to figure out how it works?  Notice that once you click on the game,
certain key presses will be sent to the game, instead of to your browser.  The
left and right arrow keys rotate the triangle, and the space bar causes it to
toss a grey circle in the direction it is facing.  If a red circle collides with
the triangle, the player loses.  If ten grey circles collide with red circles,
then the player wins. Either way, the game immediately restarts.

Since we are just using a blue triangle and red/grey circles, it's really not
clear what the perspective is.  And to be frank, right now it doesn't matter.
The most important thing for now is understanding how JetLag is being used to
make this game.

To begin, erase most of your `game.ts` file, so that it looks like this:

```typescript
{{#include ../empty/game.ts}}
```

Now that you've got the framework in place, let's start making this game. As you
probably guessed, the first thing we'll do is make the grid.  We do that by
adding this code inside the `builder` function:

```typescript
{{#include ./game_01.ts:21:22}}
```

As you write the above code, you should figure out how to get VSCode to create
the needed `import` statement for you (either by right clicking `GridSystem` or
by pressing `TAB` at the right time.)

Next, let's make the hero.  This code is pretty similar to what we did in the
last mini-game.  The main differences are:

- When we make the `FilledPolygon`, we include `z: 1`.  In JetLag, there are
  five Z planes: -2, -1, 0, 1, and 2.  When Actors are drawn, they will always
  appear "on top of" actors with a smaller Z.  If two actors have the same Z,
  the one who was created earlier will appear below the one created later.
- When we make the `PolygonBody`, there is a second argument to it:
  `{collisionsEnabled: false}`.  This indicates that when an Actor collides with
  the hero, it should not cause the hero and the other Actor to bounce off of
  each other.

Both of these changes will make sense once we write the code for tossing the
grey circles.

```typescript
{{#include game_01.ts:24:30}}
```

The next thing we'll do is set up the left and right keys, so that they rotate
the hero.  We could probably do this via the hero's `movement` component, but it
is easier to just work directly with its `rigidBody`.  We will give the body an
angular velocity (causing it to rotate at some number of rotations per second)
when a key is down-pressed, and set its angular velocity to zero when the key is
released.  Note that the units are not rotations per second, but radians per
second.  If you're not familiar with the difference, don't worry... you can just
adjust the numbers by small amounts until things make sense.

```typescript
{{#include game_01.ts:32:36}}
```

Next, let's set up the space key.  Each time it is down-pressed, we'll try to
toss a grey circle in the direction the hero is facing.  This code requires us to remember a bit of trigonometry:

```typescript
{{#include game_01.ts:38:51}}
```

If you hover over the `tossAt` method, you'll see that it takes seven arguments:

- fromX / fromY: The center of the actor who is "tossing" the projectile
- toX / toY: A point that the projectile should move toward
- actor: The actor who appears to be tossing the projectile
- offsetX / offsetY: The distance between fromX/fromY and where the projectile
  should start.

We'll discuss these more in the chapter about projectiles.  For now, what
matters is that we are making the projectile start right at the center of the
hero.  That's why we had to give the hero a Z of 1... the default is 0, so the
grey circle will appear to be under the hero, and emerge from the tip of the
hero.  (You should change the z from 1 to 0 and see what happens.)  Similarly,
we used `{collisionsEnabled: false}` for the hero, so that the projectile
wouldn't bounce off of it (again, try changing it and see what happens).  If
you're having trouble seeing how the changes are affecting your game, consider
changing `scale` to 1.

```admonish warning
A projectile that goes off-screen will keep moving forever. You
could accidentally make thousands of projectiles, and your game will get slower
and slower over time as Box2D keeps simulating these projectiles moving off
toward infinity.  In a later chapter, we'll learn how to fix this problem.
```

Next, let's make our enemies spawn.  We'll set up a timer that runs every two
seconds.  The timer will take some code (represented by `()=>{...}`) that it
will run each time two seconds transpire.

```typescript
{{#include game_01.ts:53:64}}
```

Again, the hardest part of this code is probably the trigonometry.  Let's
quickly survey what's happening.  Every two seconds, we use `Math.random()` to
get a random number.  That number will be in the range $[0\ldots1)$.  That's a
decimal, so we multiply it by $2\pi$ to get an angle, in radians.  Using some
trig (and the magic number 9), we compute a point that is 9 meters away from the
hero's center.  Then we use JetLag's `PathMovement` as we make an Actor, so that
the enemy will move from its initial point toward the center of the hero.  The
enemy will move at 3 meters per second.

When we make the `Enemy`, we indicate `{damage: 1}`.  In JetLag, heroes default
to a strength of 1, projectiles to a strength of 1, and enemies to damage
(strength) of 2.  By lowering the enemy damage to 1, we can be sure that a
single projectile collision will get rid of an enemy.

The last thing we do in this game is indicate what it means to "win", and what
should happen after the level is won or lost:

```typescript
{{#include game_01.ts:66:68}}
```

The first two lines say "on win" (or "on lose"), build this level again.  The
third line says that defeating 10 enemies is the wa to win.

In under 75 lines, we've made a reasonable first prototype of a game.  Of
course, it would take a lot of work to turn this into something we could put on
an app store, but the hardest part is to get a working prototype.  Along the
way, we saw timers, enemies, projectiles, win conditions, random numbers, and
paths.  That's quite a bit of JetLag that we were able to put to use.  In later
chapters, we'll explore each of these ideas in more detail.

Here is the [final code for this game](game_01.ts).  Before building the other
games in this chapter, you should be sure to try to make edits to this game. Can
you make it more fun? Harder?  Different?  Did everything make sense?
