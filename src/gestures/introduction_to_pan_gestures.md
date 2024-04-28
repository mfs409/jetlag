## Introduction to Pan Gestures

Pan gestures are extremely powerful: they let us draw and drag, which can both
lead to exciting gameplay options.  In this example, we'll make an on-screen
joystick that uses pan gestures to control a hero.

<iframe src="./game_03.iframe.html"></iframe>

Panning has three parts: what to do when the pan begins, what to do while it
continues, and what to do when it ends.  In the case of our joystick, the key
thing is to figure out where the gesture is occurring, relative to the center of
the joystick image.  We can use that position to compute a distance and
direction (i.e., a vector) and then apply that to the actor to make it move.

We'll start by making a border, a hero, and a destination:

```typescript
    boundingBox();

    // A hero with ManualMovement, so that the joystick can control it
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 1.5, radius: 0.4 }),
      movement: new ManualMovement(),
      role: new Hero(),
    });

    // A destination to reach
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 11, cy: 6, radius: 0.4 }),
      role: new Destination(),
    });
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

The functions for moving and stopping, along with the constants for the joystick
location and scale, look like this:

```typescript
    let jcx = 1, jcy = 8; // center of joystick
    let scale = 2;
    // here's code for moving the hero, based on how hard we're pushing the
    // joystick and where the touch is relative to the joystick center
    function doMove(_actor: Actor, hudCoords: { x: number; y: number }) {
      (hero.movement as ManualMovement).setAbsoluteVelocity(scale * (hudCoords.x - jcx), scale * (hudCoords.y - jcy));
      return true;
    }
    // And here's code for stopping the hero:
    function doStop() {
      (hero.movement as ManualMovement).setAbsoluteVelocity(0, 0);
      hero.rigidBody.clearRotation(); // be sure to try without this
      return true;
    }
```

Now we can draw the joystick on the HUD.

```typescript
    // Make a joystick
    new Actor({
      appearance: new ImageSprite({ width: 2, height: 2, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ cx: jcx, cy: jcy, radius: 1 }, { scene: stage.hud }),
      gestures: { panStart: doMove, panMove: doMove, panStop: doStop },
    });
```

Notice that if you glide your finger off the joystick, the panStop event won't
happen.  That is a problem that can be fixed, but we're not going to worry about
it for now.
