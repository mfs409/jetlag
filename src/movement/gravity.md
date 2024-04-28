## Movement Based On Gravity

A rather uninteresting movement is the "GravityMovement".  This isn't really a
movement at all... it just says that gravity will affect the actor.  It's not
really any different from making the body "dynamic", but sometimes it's useful.
Let's try it out here.  We'll make "enemies" that fall from the sky, and the
"hero" needs to dodge them.  When enemies collide with the ground, they'll
disappear.  Don't worry if some of this doesn't make sense yet... we'll explain
it all later.

First, here's the game that we're going to make:

<iframe src="game_01.iframe.html"></iframe>

You'll notice right away that the camera/gravity combination is making it seem
like we're looking at the stage from the side, not from above.  We can get that
behavior just by setting up some gravity:

```typescript
    // Downward gravity
    stage.world.setGravity(0, 10);
```

Next, we'll draw the walls.  Remember that `boundingBox()` returns the four
walls.  That's useful, because it will let us provide some code so that enemies
disappear when they hit the floor.  For now, we'll just say "if the enemy hits
the floor, it will be defeated".  When we learn more about roles, we'll realize
that's not a great plan, but it's OK for now.  We'll also *disable* the top
wall, because we want the enemies to start off screen, and slowly drop into
view.

```typescript
    let walls = boundingBox();
    (walls.b.role as Obstacle).enemyCollision = (_thisActor: Actor, enemy: Actor) => {
      (enemy.role as Enemy).defeat(false);
    }
    walls.t.enabled = false; // No top wall
```

Next, we'll set up a timer that runs every second.  Every time the timer runs,
it will create a new enemy that will fall from the sky.  In this code, remember
that the up direction is negative, and the top-left corner of the visible screen
is (0, 0).  That means we need to start with a *negative* value for y.  Also,
notice that `Math.random()` returns a number between 0 and 1 (not including 1
itself), so if we want the center to be between .5 and 15.5, then we need to
multiply the random number by 15, and add .5.

```typescript
    // Falling enemies
    stage.world.timer.addEvent(new TimedEvent(1, true, () => new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ radius: .5, cy: -.5, cx: .5 + (Math.random() * 15) }),
      role: new Enemy(),
      movement: new GravityMovement(),
    })));
```

The next part of this level is pretty straightforward: we'll add a hero who
moves via tilt.  Notice, though, that we are using a 0 as the second argument to
`enableTilt`.  That means tilt doesn't cause any up/down movement.

```typescript
    // A hero moving via tilt.  Notice that the ball "rolls" on the ground, even
    // though there's no friction.  That's because of gravity.
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 8.6, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
    enableTilt(10, 0); // Now tilt will only control left/right
```

Finally, since there is a hero and there are enemies, it's possible to lose this
level (if an enemy falls onto the hero).  We need to tell JetLag what to do in
that case.  We'll say "when the level is lost, make a new level by running
builder and passing in the current level":

```typescript
    // Any time it's possible to "lose", we need to tell JetLag what to do if the level is lost
    stage.score.onLose = { level, builder }
```

