## Introduction to Pan Gestures

Pan gestures are extremely powerful: they let us draw and drag, which can both
lead to exciting gameplay options.  In this [game](game_03.ts), we'll make an
on-screen joystick that uses pan gestures to control a hero.

<iframe src="./game_03.iframe.html"></iframe>

Panning has three parts: what to do when the pan begins, what to do while it
continues, and what to do when it ends.  In the case of our joystick, the key
thing is to figure out where the gesture is occurring, relative to the center of
the joystick image.  We can use that position to compute a distance and
direction (i.e., a vector) and then apply that to the actor to make it move.

We'll start by making a border, a hero, and a destination:

```typescript
{{#include game_03.ts:36:51}}
```

Before we draw the joystick, we need to make a plan:

- We'll put the joystick on the HUD, with a center at (1, 8) and a radius of 1.
- We'll store the joystick coordinates in variables, because we're probably
  going to refer to them in many places, and if we change the location, we don't
  want to have to update lots of code.
- When there's a down-press (`panStart`), or when there's a move (`panMove`),
  we'll compute a vector from the center of the joystick to the touch point, and
  use it to give the hero velocity.
- When there's an up-press, we'll stop the hero, and we'll also stop it from
  rotating (both of these are options we could skip).
- We won't give the hero a fixed velocity when it moves... we'll use the
  distance from the center of the joystick.  Since this might be a small number,
  we'll multiply it by a `scale`.  By putting `scale` in a variable, we can
  easily change it by changing one number in one place in the code.

As a quick reminder, "compute a vector" means we're going to use the Pythagorean Theorem:

$$
c^2 = a^2 + b^2
$$

$$
c = \sqrt{a^2+b^2}
$$

The functions for moving and stopping, along with the constants for the joystick
location and scale, look like this:

```typescript
{{#include game_03.ts:55:68}}
```

Now we can draw the joystick on the HUD.

```typescript
{{#include game_03.ts:70:75}}
```

Notice that if you glide your finger off the joystick, the `panStop` event won't
happen.  That is a problem that can be fixed, but we're not going to worry about
it for now.
