## Offsetting Graphics

Up to this point, we've always *centered* graphics on their `RigidBody`.  But in
this chapter, you also saw that text can have its top-right aligned with the
underlying body instead.  You also saw that we can stack more than one
`AppearanceComponent` onto the same body.  Among other things, this lets us
build nice user interface ("UI") elements that can move according to a single
body.

```admonish warning
This example uses the "tap" gesture, which you may not have seen yet.  If you
have trouble following along, you might want to wait until after you read the
"Gesture Input" chapter, and then come back to this example.
```

We're going to build the following game.  You can find the code [here](game_10.ts).

<iframe src="./game_10.iframe.html"></iframe>

Each time you refresh the browser, the box will slide in from the bottom.  If
you tap "yes", the box slides away to the left.  If you tap "no", it slides away
to the right.  Note that if you tap "yes" or "no" before the box makes it all
the way to its stopping point, it will change direction from its current point.

Our first decision will be how to make the `RigidBody`.  In prior examples in
this chapter, we made a small body, and that worked well.  This time, since we
want the body to receive gestures (like tap), we need it to be big.  So let's
make the body 4 meters wide and 1.5 meters tall.  Our builder is going to start
out like this:

```typescript
{{#include game_10.ts:18:20}}
{{#include game_10.ts:58:59}}
```

Next, we can figure out where to put the various appearance components.  The
final code looks like this:

```typescript
{{#include game_10.ts:21:28}}
```

The first line is our background box, and the second is the text "Are you having
fun?".  But this time, we added one more bit of configuration: `offset: {dx: 0,
dy: -.25}`.  You may remember that in algebra, we sometimes call the amount by
which something changes a "delta".  Here, `dx` and `dy` are the "delta x" and
"delta y".  They're the numbers that will be added to the center of the
`RigidBody` to figure out the center of the text.  We can add an offset to
anything, so we add four more appearance components to the actor: the text "Yes"
and the text "No", along with borders around each of those words.

Next, we instruct JetLag to make the actor slide into view from the bottom.
Remember that when we make a `Path`, the actor will immediately "teleport" to
the starting point.  So in this case, we'll start off screen `(8, 11)` and slide
upward:

```typescript
{{#include game_10.ts:29}}
```

Now we encounter a slight challenge: The *rigid body* will get tapped.  How do
we know if the tap is to the "Yes" or "No"?  Unfortunately, we need to do the
math on our own.  It gets trickier, though.  The actor is moving!  So when the
tap happens, we don't know where the actor will be.

Our solution is going to take a few lines of code:

```typescript
{{#include game_10.ts:30:57}}
```

We're providing code to run when the actor is tapped.  The code will be told
*which* actor was tapped (`actor`), and where *in the world* the tap happened
(`worldCoords`).  Our code will start by computing the center of the actor at
the instant when the tap happened.  Then it computes the top, bottom, left, and
right coordinates of the "yes" box and the "no" box.

Finally, the code does four comparisons to see if the tap is within the
coordinates of the "yes" box, and four more to see if the tap is within the
coordinates of the "no" box.  If either test succeeds, the code creates a new
path for the actor to take.

In the games you make, you'll probably want to make these sorts of boxes appear
on the HUD, not in the world.  And you'll probably want to use a function to
make them, so that you can re-use code.  Hopefully, you'll also make sure to add
comments to your code, so it's easy for you to understand!
