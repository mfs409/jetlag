## Advanced Joint Concepts: Ragdolls

You'll recall that JetLag tries to avoid the "complexity cliff".  If you need
powerful features of Pixi.js and Box2D that aren't available through JetLag, you
can reach into an Actor and get to the underlying thing that you need.

To illustrate this point, we're going to build out a "ragdoll".  Our goal will
be to have a character with a body, such that the body parts flop around as the
body is tossed across the stage.

If you were to look at the implementation of `setRevoluteJoint` and
`setRevoluteJointLimits` in the `RigidBody.ts` file, you would find that JetLag
assumes you will only ever want one joint per body.  But if you think about a
RagDoll, that doesn't really make sense... if you had a character riding on a
motorcycle, you'd need some bodies to have more than one joint.  And even if
not, it can be convenient for all joints to be relative to the same body part,
such as a character's torso.

The [Box2D Ragdoll
Example](https://lusito.github.io/box2d.ts/testbed/#/Examples#Ragdolls) shows an
advanced version of what we're going to build.  The [code for the
example](https://github.com/Lusito/box2d.ts/blob/master/packages/testbed/src/tests/core/ragdolls.ts)
only deals with Box2D stuff, like bodies and joints.  Using it as inspiration,
we're going to make a simplified ragdoll example.  Here's the [code](game_04.ts)
for the game we'll make.  When we're done, it will look like this:

<iframe src="./game_04.iframe.html"></iframe>

We're going to make a function for drawing the ragdoll, so let's set it up:

```typescript
{{#include game_04.ts:13:22}}
{{#include game_04.ts:80}}
```

For now, we'll have a very simple builder, that just makes one ragdoll that
doesn't move:

```typescript
{{#include game_04.ts:81:86}}
  makeRagDoll(5, 3, 0, 0, 0);
}
```

Lastly, since we're going to be using some Box2D features directly, we're going
to need to import them.  Often, you'll need a line like this:

```typescript
import { b2RevoluteJointDef, b2Vec2 } from "@box2d/core";
```

But in this specific case, JetLag provides both of those, so you can import them
from JetLag directly:

```typescript
{{#include game_04.ts:1}}
```

### Making the Bodies

We'll begin by making the rigid bodies.  Right now, there is no gravity in the
world, so we should be able to build 5 RigidBodies with proper positioning to
look like a human.  As you're following along with this code, be sure to test as
you go, so you can see how everything fits together.

```admonish warning
It is very easy to make code that is **very hard** to maintain.  In the
following code, notice how I use constants to govern the sizes of things, and
also notice how there's a little bit of math so that everything is relative to
the head.  When you finish this chapter, think about how much harder it would have been to fine-tune things if I didn't do things this way.
```

Since we want all of the parts of the body to have good collision behaviors,
we're going to want everything to be dynamic.  It turns out that JetLag's
default behavior is for Heroes to "pass through" other heroes, which won't work
nicely, so we're also going to make the body parts as Obstacles.  We're going to
work in the `makeRagDoll` function.  To make the head, we'll define the head's
radius, and then make a circle:

```typescript
{{#include game_04.ts:23:29}}
```

Next, let's make the torso.  Notice how we use two constants for its width and
height, and then we use those constants, along with the head radius, to compute
the position of the center of the torso.  If you're having trouble making sense
of it, here's a quick way to understand what's happening.  We want the torso
directly below the head, with the centers of the head and torso aligned
vertically.  That means the torso should have the same center Y as the head.  As
for its center X, we need to go down by the head's radius and half the torso's
body to get to the center of the torso.

```typescript
{{#include game_04.ts:30:37}}
```

Using the same approach, we can make the arms and legs:

```typescript
{{#include game_04.ts:39:65}}
```

### Connecting the Bodies

Right now, the body just floats in mid air.  Before we add gravity, we need to
connect the parts to each other.  It takes 10 lines of code to connect two
bodies, and the code is the same for each of the five connections we need to
make.  Let's create a helper function:

```typescript
{{#include game_04.ts:130:156}}
```

In the code, notice that we're turning the angles from degrees to radians.  That
means the code we write can be a bit easier to understand, since degrees are
usually easier to think about.

Given this code, we can set up the joints quite easily:

```typescript
{{#include game_04.ts:67:74}}
```

However, there's a problem.  Where did I come up with these numbers?  There are
two aspects to these calls.  One thing I had to do was think of *where* on each
body the joint should attach.  These numbers become the "local anchors".  They
are relative to the center of each body, so `join(torso, 0, -TH/2 - .02, ...)`
is saying that this joint should connect a point that is vertically aligned with
the center of the torso, and .02 meters above the torso's top, and `join(...,
head, 0, HR + .01, ...)` indicates that the other point of the joint is
vertically aligned with the center of the head, and .01 meters below the head's
bottom.

What about `-25, -25`?  Those are the minimum and maximum degrees of rotation
that the joint will allow.  I found them through trial and error.  First, I put
this line into the builder:

```typescript
{{#include game_04.ts:124}}
```

Now that there's gravity, the whole ragdoll will fall down.  Next, I temporarily
set `dynamic: false` on the head's RigidBody.  Then I added these lines to the
end of `makeRagDoll`:

```typescript
{{#include game_04.ts:76:78}}
```

And finally, I changed the call to `makeRagDoll` in builder:

```typescript
  makeRagDoll(5, 3, 10, -10, 2);
```

With those impulses, I could see how things moved around, and I could fine-tune
the angle limits.  When things looked "good enough", I set the head back to
`dynamic: true`, and the body fell off the screen.

### Adding Static Bodies

Next, let's add some static bodies to the world.  This is probably the most
familiar code, since it's just regular JetLag stuff.  In the builder, we can add
a floor:

```typescript
{{#include game_04.ts:92:97}}
```

Then we can use loops to make the stairs:

```typescript
{{#include game_04.ts:99:115}}
```

And then we can draw a box in the middle:

```typescript
{{#include game_04.ts:117:122}}
```

With these in place, I was able to fine-tune the joint limits, so that the arms
and legs didn't "bend" too crazily.

### Finishing Up

To finish the game, I replaced the call to `makeRagDoll` with these three calls:

```typescript
{{#include game_04.ts:87:90}}
```

Note that if we wanted to, we could save the joints (and even the joint
definitions).  The easiest way would be to save them in the torso's `extra`.
This could be useful if, for example, you joined your ragdoll to a motorcycle,
and wanted to break the joints so the ragdoll lept off the motorcycle when it
crashed.
