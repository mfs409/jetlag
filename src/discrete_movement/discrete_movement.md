# Discrete Movement

In most of the games we've made so far, we've relied on Box2D to move things.
This has given nice, smooth motion, but sometimes smooth motion makes a game
*harder*.  For example, in "A Maze Game", it was easy to accidentally bump into
corners.

In this chapter, we'll briefly look at a way to work around this problem.  We'll
make a game that feels more like an old-school 1980s game... each time a key is
pressed, the character will move by exactly one square.  If we hold the key
down, the character will move for longer, but still moving forward by an exact
number of squares.

Here's what the game will look like.  The full code for this game can be found
[here](game.ts).

<iframe src="./game.iframe.html"></iframe>

The first thing to notice is that we're using a nicer image.  You can find it
here:

- [pirate.json](../assets/pirate.json)
- [pirate.png](../assets/pirate.png)

The reason we're using this image is so that we can also see how to get an
acceptable animation effect with this kind of movement.  In the code, you'll see
that we've got a simple animation:

```typescript
{{#include game.ts:43:48}}
```

Next, when we make the hero, we make its body slightly smaller than a `1x1`
square:

```typescript
{{#include game.ts:49:54}}
```

Now comes the hard part.  If we're manually re-positioning the hero in response
to key presses, then we can't rely on Box2D's collision detection to tell us
when there is something we would collide with.  Instead, we're going to need to
make our own code for this purpose.  In addition, each time the hero moves a
little bit, we want to animate it a little bit.

Let's start with the manual collision detection code.  If we had an actor named
`a`, we could check if there was an actor whose center was `(dx, dy)` units away
from a's center like this:

```typescript
{{#include game.ts:58:61}}
{{#include game.ts:63}}
```

This code says "ask the physics world for a list of all the actors that overlap
with this `(x, y)` point.  For each, if it's an `Obstacle`, return immediately.
But what about goodies, enemies, and destinations?  It turns out that we can
just say this when it's not an Obstacle:

```typescript
{{#include game.ts:62}}
```

You can understand this as "otherwise, run the code that would happen if JetLag
discovered that the hero collided with the thing at that position".

If we didn't encounter an obstacle, we can move the actor like this:

```typescript
{{#include game.ts:73}}
```

All that remains is to update the animation.  We can do that by choosing a
short-term (non-looping) animation based on the direction of movement:

```typescript
{{#include game.ts:64:72}}
```

That's a lot of code.  We don't want to repeat it four times, for the four
directions, so we'll put it in a function:

```typescript
{{#include game.ts:56:80}}
```

There's one other problem, though.  In the original maze game, we used the
`boundingBox` function, which drew a thin box around the screen.  Our hero could
walk right through it, because the collision calculation we just made always
looks one meter away from the hero.  To fix that, we'll change the map slightly,
so that it draws off-screen boxes instead of a wall.  

As you finish up this chapter, please be sure to compare the code from this
chapter with the code for the maze game, to see how all of these parts fit
together.
