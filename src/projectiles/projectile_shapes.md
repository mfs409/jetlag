## Projectile Shapes

Projectiles don't have to be circles... they are actors, like any other, so they
can use any sort of rigid body.  In this example, we'll make long, skinny
rectangles.  If you turn off hit boxes in your `Config`, these will look like
laser beams.

The other new aspect of this example is *how* we toss the projectiles.  Instead
of using `tossFrom()`, we'll use pan gestures to get a location, and `tossAt()`
to toss the projectiles toward that location.

<iframe src="./game_04.iframe.html"></iframe>

We'll start by putting a border on the screen, and a hero.  The hero can't move,
but having a border will ensure that our projectiles will collide with an
obstacle, so they can be reclaimed.

```typescript
    boundingBox();
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: 0.4 }),
      role: new Hero(),
    });
```

Next, we'll set up a pool of projectiles.  We want to tell the `tossAt()`
function how they ought to be thrown, so we provide two extra configuration
options: `fixedVectorVelocity` indicates that the projectiles should move with
velocity 10 in whatever direction the `tossAt()` vector decides to throw them
in.  `rotateVectorToss` indicates that we want the projectile to be rotated in
the direction it is moving.  If we didn't have this, our "laser beams" would
look like very strange, skinny walls.

We have some other new bits of configuration here.  When we make the
projectiles' bodies, `collisionsEnabled: false` ensures that they don't bounce
off of things.  This is a way of addressing our concern about them making the
hero move, and is especially useful here, since they'll seem to come out of the
center of the hero.  We'll also use `disappearOnCollide: true` in the role, to
indicate that when two projectiles collide, one should disappear.  You should,
of course, try to change any and all of these values, to see how the game
changes.

```typescript
    // set up a pool of projectiles with fixed velocity.  They will be rotated
    // in the direction they travel.
    let projectiles = new ActorPoolSystem();
    // set up the pool of projectiles
    for (let i = 0; i < 100; ++i) {
      let appearance = new FilledBox({ width: 0.02, height: 1, fillColor: "#FF0000" });
      let rigidBody = new BoxBody({ width: 0.02, height: .5, cx: -100, cy: -100 }, { collisionsEnabled: false });
      // let's not let gravity affect these projectiles
      let reclaimer = (actor: Actor) => { projectiles.put(actor); }
      let role = new Projectile({ disappearOnCollide: true, reclaimer });
      let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement({ fixedVectorVelocity: 10, rotateVectorToss: true }), role });
      projectiles.put(p);
    }
```

Now let's cover the HUD with a button for tossing these projectiles. This will
have the same "toggle" feeling as we saw in the tutorial on gestures.  But we'll
use gestures to figure out *where* to toss the projectile, and a timer to limit
the rate at which they are tossed.  This code is a bit more complex than you
might have expected, and it's not the only way we could choose to achieve this
behavior.

Just like in the tutorials on gestures, the hard part is defining the functions
we'll want to use.  It is tempting to use pan, but unfortunately, `panStart`
doesn't happen until there is movement.  So instead, we'll use a combination of
`touchDown`, `touchUp`, and `panMove`.  On a down-press or move, we'll set
`isHolding` true, to indicate that we want to toss a projectile, and we'll save
the world coordinates of the touch in a vector (`v`).  When the touch is
released, we'll just set `isHolding` to false.

```typescript
    let v = new b2Vec2(0, 0);
    let isHolding = false;
    // On the initial touch, figure out where in the world it's happening
    let touchDown = (_actor: Actor, hudCoords: { x: number; y: number }) => {
      isHolding = true;
      let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
      let world = stage.world.camera.screenToMeters(pixels.x, pixels.y);
      v.x = world.x;
      v.y = world.y;
      return true;
    };
    // On a release of the touch, stop tossing
    let touchUp = () => { isHolding = false; return true; };
    // Move will be the same as touchDown
    let panMove = touchDown;
```

Next, we'll set up a timer.  It will keep track of the time of the last toss,
and only toss if two conditions are met:

- The button for tossing is still being held (`isHolding`)
- It has been more than 100ms since the last toss

Notice that we don't use the JavaScript `Date`, but instead
`stage.renderer.now`.  `stage.renderer.now` tracks the number of milliseconds
that have transpired *in the stage*.  It doesn't count time spend on overlays,
such as pause scenes.

```typescript
    // Set up a timer to run at high frequency
    let lastToss = 0;
    stage.world.timer.addEvent(new TimedEvent(.01, true, () => {
      if (isHolding) {
        let now = stage.renderer.now;
        // Only throw once per 100 ms
        if (lastToss + 100 < now) {
          lastToss = now;
          // We can use "tossAt" to throw toward a specific point
          let p = projectiles.get();
          if (p) (p.role as Projectile).tossAt(h.rigidBody.getCenter().x, h.rigidBody.getCenter().y, v.x, v.y, h, 0, 0);
        }
      }
    }));
```

You'll notice that our timer calls `tossAt()`.  It takes seven parameters:

- `fromX`   The X coordinate of the center of the actor doing the toss
- `fromY`   The Y coordinate of the center of the actor doing the toss
- `toX`     The X coordinate of the point at which to toss
- `toY`     The Y coordinate of the point at which to toss
- `actor`   The actor who is performing the toss
- `offsetX` The x distance between the center of the projectile and the center of
  the actor tossing the projectile
- `offsetY` The y distance between the center of the projectile and the center of
  the actor tossing the projectile

Remember that you can hover over `tossAt`, and VSCode will share this
information with you.

Finally, we'll put the button on the screen for controlling the projectiles:

```typescript
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
      gestures: { touchDown, touchUp, panMove }
    });
```

Debugging projectiles can be tricky.  In this example, one challenge was that we
had to use touch and pan in an unusual way.  But if you put your hero very close
to the wall, you might find that your projectiles seemed not to work.  Based on
how we are putting them at the center of the hero, the issue could be that, due
to the length of the projectile, the "back end" is touching the wall, leading to
it being reclaimed.  Sometimes the best strategy is to use `console.log()` to
put some debugging statements into your code, and then to watch in the developer
console (accessed by pressing `F12` in your browser) to see what's happening.
