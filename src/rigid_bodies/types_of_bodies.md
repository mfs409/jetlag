## Types Of Rigid Bodies

In Box2D, a rigid body can have one of three different types.

- Static bodies don't move at all, ever.
- Kinematic bodies can move, but are not subject to forces
- Dynamic bodies can move, and are subject to forces

We're going to build the following game to start understanding what these different types mean.  Be sure to try to cause the green ball to collide with each purple ball:

<iframe src="./game_01.iframe.html"></iframe>

Before we begin, you'll need to download two image files and put them in your
`assets` folder:

- [green_ball.png](rigidbody/green_ball.png)
- [purple_ball.png](rigidbody/purple_ball.png)

Once that's set, set up an empty game ([game.ts](../empty/game.ts)) and then update your `Config` object by
adding these lines:

```typescript
{{#include game_01.ts:12:15}}
```

In addition, since this mini-game will use the `enableTilt` and `boundingBox`
functions from our `common.ts` file, we need to add this line up at the top,
along with the other import statement:

```typescript
{{#include game_01.ts:2}}
```

In builder, we'll start by turning on Tilt and drawing a bounding box:

```typescript
{{#include game_01.ts:33:36}}
```

Next, let's make an actor who moves via Tilt.  Note that attaching a
`TiltMovement` component automatically transforms the body to be dynamic.
Actually, attaching a `Hero` component also automatically transforms the body to
be dynamic.  So this hero is **definitely** dynamic.

```typescript
{{#include game_01.ts:38:44}}
```

Next, we'll draw three obstacles.  Obstacles default to being static, but we'll
override that for the second and third obstacle.

```typescript
{{#include game_01.ts:46:62}}
```

So far, this is what the code should look like:

```typescript
{{#include game_01.ts}}
```

Unfortunately the kinematic and static obstacles don't seem to have any
difference in their behavior.  Let's see what happens when we give each of the
obstacles some velocity.  Let's start by rewriting the builder like this:

```typescript
{{#include game_02.ts:24:57}}
```

You'll notice that *a lot* just changed:

- The static obstacle still doesn't move
- The kinematic and dynamic obstacles collide, but only the dynamic one
  experiences a transfer of momentum.
- The kinematic obstacle does not detect a collision with the wall, so it passes
  through it.

Let's add a few more kinematic and static obstacles:

```typescript
{{#include game_02.ts:59:88}}
```

Here's the resulting game:

<iframe src="./game_02.iframe.html"></iframe>

In the game, you can see that the kinematic obstacles "pass through" each other,
and retain their velocity.  The dynamic obstacles experience a transfer of
momentum, which means they both just stop.  If you made one move faster than the
other, you'd see a different transfer of momentum.

You might have also noticed some strange behavior on the right side of the
screen (if not, refresh the page and look carefully).  Physics simulations are
not perfect!  In this one, we had a kinematic body pushing a dynamic body into
the wall.  At some point, the calculations for where things needed to be just
stopped working, and the balls seemed to pass through each other.  It's
important to pay attention to these kinds of little details, and to come up with
workarounds when necessary.

The other important issue here is that the dynamic bodies are subject to forces.
We saw some version of this idea in the way that there was a transfer of
momentum between static and dynamic bodies, and from kinematic bodies to dynamic
bodies.  It also explains why the dynamic body bounces off of the static body.

At this point, the code should look like [this](game_02.ts):

Finally, in the last chapter, we added gravity, which is a force.  Let's add
gravity to our original code from this chapter, and see what happens.  We just
need to add one line:

```typescript
    // Note: you could have negative gravity, to make things float upward...
    stage.world.setGravity(0, 10);
```

Now any dynamic bodies will start falling, while the static and kinematic ones
do not!

<iframe src="./game_03.iframe.html"></iframe>

[Here is the final code](game_03.ts)
