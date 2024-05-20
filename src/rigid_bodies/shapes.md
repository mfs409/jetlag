## Rigid Body Shapes

In a previous chapter, we saw that each rigidBody can have one of three shapes:
a box (rectangle), a circle, or a convex polygon.  Let's make a game that shows
all of these options.

<iframe src="./game_04.iframe.html"></iframe>

To get started, be sure to download these images to your `assets` folder:

- [blue_ball.png](rigidbody/blue_ball.png)
- [green_ball.png](rigidbody/green_ball.png)

To appreciate this game, it will be important for the `Config` object to set
`hitBoxes` to `true`, because it lets us see the outline of the rigidBody...
even when there's an image covering it.  

In the code for this example, you will also notice that we're providing
different additional configuration information to the rigidBodies than we did
previously.  If you hover your mouse over `CircleBody` or `BoxBody` or
`PolygonBody`, you'll see a list of all the possible options.

Of course, we start off by setting up a bounding box and turning on tilt
control:

```typescript
{{#include game_04.ts:28:30}}
```

Now let's have a look at the different actors in the game.  We'll start with a
circle, which takes a radius.  This one also has an extra parameter when making
the `CircleBody`, to make it rotate five times per second.  Any kind of body can have a rotation speed:

```typescript
{{#include game_04.ts:35:40}}
```

Next, we draw a box, which requires that we provide a width and height.  Note
that the `cx` and `cy` coordinates are for the *center* of the box:

```typescript
{{#include game_04.ts:42:47}}
```

Polygons are a bit trickier.  We need to provide an "array", which is just a
series of numbers, separated by columns.  These represent the coordinates of the
points on the edge of the polygon.  They are all relative to the center of the
polygon, though, which can be a bit confusing at first.  When you get used to
it, you'll find it's really nice, because it means you don't have to think about
where the polygon is, just its shape.

```typescript
{{#include game_04.ts:56:62}}
```

It's worth noting that when you make a polygon, the vertices may not surround
the center, and that's OK, as long as the polygon is still convex:

```typescript
{{#include game_04.ts:65:71}}
```

We can also rotate bodies by a fixed amount, which is especially useful for
boxes.  The easiest way to do this is *after* the actor has been created, by
calling `setRotation` on its `rigidBody`.  When you do, be sure to provide a
rotation in radians ($\pi$ radians is the same as $180$ degrees):

```typescript
{{#include game_04.ts:76:81}}
```

Here is the [full code](game_04.ts) for this level.

In the mini-game, be sure to use the arrows to make the green ball move around
and interact with the other shapes.  You should see that Box2D is doing quite a
bit to make the interactions between shapes behave like it would in the real
world.

Before moving on, there are two things worth trying:

- Watch what happens if you take away the green ball's role.  If you do this, it
  will get the default role, which is `Passive`.  Passive actors don't collide
  with anything, so your green ball will now pass through all the obstacles.
- It's possible to override the behavior of tilt, so that it applies a
  *velocity* instead of a force.  Try adding these lines, and watching how the
  movement of the actor changes:

```typescript
    // While we're at it, we're going to change how tilt works... let's make it
    // affect velocity directly, instead of inducing forces:
    stage.tilt.tiltVelocityOverride = true;
```
