## Gestures In The HUD And World

In the previous levels, any single kind of gesture only happened in one place.
That doesn't always make sense.  For example, suppose that we wanted to make a
game where you could tap an actor, then tap the screen, and the actor would
teleport to that location.  Should the HUD get the tap first?  Should the world?

First, let's look at the game we're making.  There are three actors.  Tapping
one "activates it".  Tapping the screen will make one actor "teleport" to that
spot, another move *to* that spot via a path, and the third actor move *toward*
that spot, but not stop when it reaches it.

<iframe src="./game_07.iframe.html"></iframe>

By default, JetLag routes gestures to the HUD first, and the world second.  We
can override this behavior:

```typescript
    // This effectively puts the tappable region "under" the world, so that
    // pokes can find an actor before trying to move an actor.
    stage.gestures.gestureHudFirst = false;
```

Then we'll put a border on the world:

```typescript
    boundingBox();
```

Each actor is going to have an `extra` that has a function in it called
`poke_responser`.  The idea is that tapping an actor will "activate" it, and
tapping anywhere else will call the activated actor's `poke_responder`.  So
then, the first thing we'll need is a way to track the activated actor:

```typescript
    // Track the actor most recently tapped
    let lastTapActor: Actor | undefined = undefined;
```

Next, let's make an actor who can "teleport".  Tapping it will "activate" it.
Double-tapping will remove it.  We'll detect a double tap by recording the time
of the tap.  Two taps within 300 milliseconds feels about right for a double
tap, so we'll compare the time of the taps and see if they're less than 300ms
apart.  Finally, the `poke_responder` will simply change the coordinates of this
actor.

```typescript
    let teleport_actor = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 14, cy: 1, radius: .5 }),
      gestures: {
        tap: () => {
          let x = stage.renderer.now; // Time of this tap
          // If it's been less than 300 milliseconds since the last tap, remove
          // it
          if (x - teleport_actor.extra.last_tap < 300 && lastTapActor == teleport_actor) {
            lastTapActor = undefined;
            teleport_actor.remove();
            return true;
          }
          // Otherwise, remember the time of the tap, and that it is activated
          teleport_actor.extra.last_tap = x;
          lastTapActor = teleport_actor;
          return true;
        }
      },
      extra: {
        last_tap: 0,
        poke_responder: (meters: { x: number, y: number }) => { teleport_actor.rigidBody.setCenter(meters.x, meters.y); }
      }
    });
```

Next, let's make the actor who moves via a path.  The tricky issue here is that
we need it to start with a path, because we can't change the `movement` on the
fly.  So we give it a path with one point and zero velocity.  Then, in its
`poke_responder()`, we reset its speed and angular velocity, then give it a new
path.

```typescript
    // make an actor who can move along a path.
    let path_actor = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 14, cy: 2, radius: .5 }),
      movement: new PathMovement(new Path().to(14, 1), 0, false),
      gestures: {
        tap: () => { lastTapActor = path_actor; return true; }
      },
      extra: {
        poke_responder: (meters: { x: number, y: number }) => {
          let r = new Path().to(path_actor.rigidBody.getCenter().x, path_actor.rigidBody.getCenter().y).to(meters.x, meters.y);
          path_actor.rigidBody.body.SetLinearVelocity({ x: 0, y: 0 });
          path_actor.rigidBody.body.SetAngularVelocity(0);
          (path_actor.movement as PathMovement).resetPath(r, 5, false);
        }
      }
    });
```

Our third actor will move *toward* the position that was poked.  This requires a
little bit of trig, to compute the direction.

```typescript
    // This actor will move in a direction, but won't stop
    let walk_actor = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 14, cy: 3, radius: .5 }),
      movement: new ManualMovement(),
      gestures: {
        tap: () => { lastTapActor = walk_actor; return true; }
      },
      extra: {
        poke_responder: (meters: { x: number, y: number }) => {
          let speed = 2;
          // This might be a nice time to brush up on your trigonometry :)
          let dx = meters.x - walk_actor.rigidBody.getCenter().x;
          let dy = meters.y - walk_actor.rigidBody.getCenter().y;
          let hy = Math.sqrt(dx * dx + dy * dy) / speed;
          let v = new b2Vec2(dx / hy, dy / hy);
          walk_actor.rigidBody.body.SetAngularVelocity(0);
          walk_actor.rigidBody.body.SetLinearVelocity(v);
        }
      }
    });
```

Finally, we can cover the HUD with an actor.  Tapping it will check if there is
an "activated" actor.  If so, we'll translate the touch to world coordinates and
give those coordinates to the activated actor's `poke_responder()`.

```typescript
    // Make the tappable region on the hud
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
      gestures: {
        tap: (_actor: Actor, hudCoords: { x: number; y: number }) => {
          if (!lastTapActor) return false;
          let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
          let meters = stage.world.camera.screenToMeters(pixels.x, pixels.y);
          // move the actor:
          lastTapActor.extra.poke_responder(meters);
          // don't interact again without re-activating
          lastTapActor = undefined;
          return true;
        }
      }
    });
```

You should see what happens if you change this code.  For example, do you like
the effect that you get if you skip `lastTapActor = undefined`?  What happens if
you tap one actor, then another?  Can you think of a better way to manage taps
between the HUD and the world?
