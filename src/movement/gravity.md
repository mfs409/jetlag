## Movement Based On Gravity

A rather uninteresting movement is the "GravityMovement".  This isn't really a
movement at all... it just says that gravity will affect the actor.  It's not
really any different from making the body "dynamic", but sometimes it's useful.
Let's try it out here.  We'll make "enemies" that fall from the sky, and the
"hero" needs to dodge them.  When enemies collide with the ground, they'll
disappear.  Don't worry if some of this doesn't make sense yet... we'll explain
it all later.

First, here's the game that we're going to make (and [here](game_01.ts) is the code for it):

<iframe src="game_01.iframe.html"></iframe>

To get started, you'll need an empty [game.ts](../empty/game.ts), [common.ts](../common/common.ts), and these
files:

- [red_ball.png](../assets/red_ball.png)
- [green_ball.png](../assets/green_ball.png)

In the game, you'll notice right away that the camera/gravity combination is
making it seem like we're looking at the stage from the side, not from above.
We can get that behavior just by setting up some gravity:

```typescript
{{#include game_01.ts:40:41}}
```

Next, we'll draw the walls.  Remember that `boundingBox()` returns the four
walls.  That's useful, because it will let us provide some code so that enemies
disappear when they hit the floor.  For now, we'll just say "if the enemy hits
the floor, it will be defeated".  When we learn more about roles, we'll realize
that's not a great plan, but it's OK for now.  We'll also *disable* the top
wall, because we want the enemies to start off screen, and slowly drop into
view.

```typescript
{{#include game_01.ts:28:32}}
```

Next, we'll set up a timer that runs every second.  Every time the timer runs,
it will create a new enemy that will fall from the sky.  In this code, remember
that the up direction is negative, and the top-left corner of the visible screen
is (0, 0).  That means we need to start with a *negative* value for y.  Also,
notice that `Math.random()` returns a number between 0 and 1 (not including 1
itself), so if we want the center to be between .5 and 15.5, then we need to
multiply the random number by 15, and add .5.

```typescript
{{#include game_01.ts:37:43}}
```

The next part of this level is pretty straightforward: we'll add a hero who
moves via tilt.  Notice, though, that we are using a 0 as the second argument to
`enableTilt`.  That means tilt doesn't cause any up/down movement.

```typescript
{{#include game_01.ts:45:52}}
```

Finally, since there is a hero and there are enemies, it's possible to lose this
level (if an enemy falls onto the hero).  We need to tell JetLag what to do in
that case.  We'll say "when the level is lost, make a new level by running
builder and passing in the current level":

```typescript
{{#include game_01.ts:54:55}}
```
