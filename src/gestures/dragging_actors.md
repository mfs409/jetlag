## Dragging Actors

We can use `panMove` as a way to drag an actor on the screen.  Of course, this
will again require us to put the actor who receives the `pan` gestures on the
HUD.  Here's the game we'll build:

<iframe src="./game_05.iframe.html"></iframe>

We'll start the level by making a border, setting gravity, and then drawing
three obstacles.

The challenge we're going to face here is that dragging (i.e., `panMove`) needs
to be received by some actor.  We saw with the joystick that when your finger
glided off the joystick, there was no `panStop` event.  This seems like it's
going to be an even bigger problem if we take our tiny little obstacles and
attach `pan` gestures to them.  So instead, we're going to put an actor on the
HUD, and have it receive the `pan` gestures.  But then how can we know which
actors are draggable, and which aren't?  Our solution will be to mark the
obstacles by putting some information in their `extra` field.

```typescript
    boundingBox();
    stage.world.setGravity(0, 10);

    // draw two obstacles that we can drag, and one that we can't.  The whole
    // key to deciding who is draggable and who isn't will be whether we give
    // them "extra" information.
    new Actor({
      appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: 2, radius: 0.375 }, { dynamic: true }),
      movement: new ManualMovement(),
      role: new Obstacle(),
      extra: { drag: true }
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 14, cy: 1, radius: 0.375 }, { elasticity: 1 }),
      movement: new ManualMovement(),
      role: new Obstacle(),
      extra: { drag: true }
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 13, cy: 1, radius: 0.375 }, { elasticity: 1 }),
      movement: new ManualMovement(),
      role: new Obstacle(),
    });
```

We're going to want to put an actor on the HUD, covering the whole screen.  When
we do, how will we know which actor is being dragged (if any)?

Fortunately, Box2D lets us ask the world to give us every actor at a certain
point.  So if we turn the hud coordinates of the `panStart` into world
coordinates, we can then give those coordinates to `stage.world.physics` and it
will give us all the actors who might be receiving a touch.  `panStart` won't
actually do any moving, but if it finds such an actor, it will save it in a
variable, so that `panMove` will know who to move.  Notice that this also lets
us ignore `panStart` on the obstacle that doesn't have an `extra`.

In the code below, `foundActor` is the actor that `panStart` finds:

```typescript
    // We need a way to keep track of the actor currently being dragged.  We'll
    // use this local variable (but we *could* use "level" storage)
    let foundActor: Actor | undefined;
    // pan start updates foundActor if there is an actor where the touch began
    let panStart = (_actor: Actor, hudCoords: { x: number; y: number }) => {
      // Turn HUD coordinates to world coordinates
      let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
      let world_coords = stage.world.camera.screenToMeters(pixels.x, pixels.y);
      // Ask the physics world for all actors at that position, and stop when we find one who is draggable:
      for (let actor of stage.world.physics!.actorsAt(world_coords)) {
        if (actor.extra.drag) {
          foundActor = actor;
          return true;
        }
      }
      return false;
    };
```

Now we can define `panMove` as a function that turns the HUD coordinates of the
`panMove` event into world coordinates, and moves the actor to that point.

```typescript
    // pan move changes the actor's position
    let panMove = (_actor: Actor, hudCoords: { x: number; y: number }) => {
      // If we have an Actor, move it using the translated coordinates
      if (!foundActor) return false;
      let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
      let meters = stage.world.camera.screenToMeters(pixels.x, pixels.y);
      foundActor.rigidBody?.setCenter(meters.x, meters.y);
      return true;
    };
```

When the `pan` event ends, we'll set `foundActor` back to `undefined`.  Notice
that while we were dragging, the actor might not have been correctly interacting
with other rigid bodies or gravity.  Calling `SetAwake()` lets Box2D know that
it needs to get caught up with the new location.

```typescript
    // pan stop clears foundActor to stop letting this actor be dragged
    let panStop = () => {
      if (!foundActor) return false;
      // This turns gravity back on, if appropriate
      foundActor.rigidBody.body.SetAwake(true);
      foundActor = undefined;
      return true;
    };
```

Now we have all the code we need, so let's cover the HUD with a button that
handles the pan gestures:

```typescript
    new Actor({
      appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
      gestures: { panStart, panMove, panStop },
    });
```

If you were to combine this mini-game with the previous one, you could use pan
gestures to draw actors on the screen.  This may seem like a silly idea, but
sometimes silly ideas can be big hits.  More than 1M downloads came from a game
that noticed that you could use panMove as a way to "scribble" on the screen to
make a track for a car to drive on!
