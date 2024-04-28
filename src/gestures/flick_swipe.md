## The Flick/Swipe Gesture

Mobile games popularized the idea of flicking/swiping as a way to control
actors.  Let's see how to do it in JetLag:

<iframe src="./game_06.iframe.html"></iframe>

In this mini-game, most of the code is similar to what we saw in the dragging
example.  We'll create a border, set gravity, and make some actors.  The ones
who can be flicked will have an `extra` field containing the speed at which
they should move.

```typescript
    boundingBox();
    stage.world.setGravity(0, 10);

    // create a few Actors that can be flicked, and one who cannot
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 1, radius: 0.4 }),
      movement: new ManualMovement(),
      role: new Hero(),
      extra: { flickSpeed: 1 }
    });
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 6, cy: 6, radius: 0.4 }, { dynamic: true }),
      movement: new ManualMovement(),
      role: new Obstacle(),
      extra: { flickSpeed: 0.5 }
    });
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 6, cy: 5, radius: 0.4 }, { dynamic: true }),
      movement: new ManualMovement(),
      role: new Obstacle(),
    });
```

The main difference between swipe and pan is that swipe is a single event: we
don't see its start, move, and end as separate entities.  Instead, we get the
actor who received the swipe, the coordinate where the swipe began, the
coordinate where it ended, and the time that it took for the player to perform
the swipe.

Using this information, we have to do many things:

1. Figure out if there is an actor at the world coordinate that corresponds to
   where the swipe started.
2. Compute the velocity (direction, magnitude) of the line from the starting
   coordinate to the ending coordinate.
3. Multiply that velocity by the speed that we assigned to the actor.
4. Apply that velocity to the actor.

```typescript
    // A swipe gesture consists of starting coordinates and ending coordinates,
    // as well as the amount of time the swipe took
    let swipe = (_actor: Actor, hudCoord1: { x: number; y: number }, hudCoord2: { x: number; y: number }, time: number) => {
      // Convert starting coordinates from hud to world
      let screenCoord1 = stage.hud.camera.metersToScreen(hudCoord1.x, hudCoord1.y);
      let worldCoord1 = stage.world.camera.screenToMeters(screenCoord1.x, screenCoord1.y);
      // Is there a flickable actor there?
      let foundActor: Actor | undefined = undefined;
      for (let actor of stage.world.physics!.actorsAt(worldCoord1)) {
        if (actor.extra.flickSpeed != undefined) {
          foundActor = actor;
          break;
        }
      }
      if (!foundActor) return false;

      // Figure out the velocity to apply, then apply it
      let v = new b2Vec2(hudCoord2.x, hudCoord2.y)
      v = v.Subtract(hudCoord1);
      v.Normalize();
      v.Scale(foundActor.extra.flickSpeed * 2000 / time);
      (foundActor.movement as ManualMovement).updateVelocity(v.x, v.y);
      return true;
    };
```

Once again, we see that the function for what to do is much more complicated
than the code for making the button:

```typescript
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
      gestures: { swipe }
    });
```

In the code above, one interesting thing to note is that we never bothered to
translate the vector from hud coordinates to world coordinates.  That's safe,
because both were in meters.  However, if we had some notion of zoom, then we
might need to scale the vector by the zoom factor.  Another thing you'll notice
is that we didn't scale the vector by `flickspeed/time`.  Instead we also
multiplied it by 2000.  I chose 2000 because it made things feel right.  You
will find that for your games, based on actor sizes and densities, you might
have to come up with a multiplier like that.  It usually requires some trial and
error.
