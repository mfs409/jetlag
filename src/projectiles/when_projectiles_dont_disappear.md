## When Projectiles Don't Disappear

In the following example, we don't always want our projectiles to disappear.
Watch what happens as you toss projectiles and they collide with different
obstacles.  Also, notice how a hint appears after a little while, and how
there's a way to jump-and-toss.

<iframe src="./game_07.iframe.html"></iframe>

Below is the code for this example.  If you've been following through the
tutorial, there is probably only one thing that will surprise you.  We need to
get the projectile to "bounce off of" the bucket, instead of disappearing.

The way we do this is by providing custom code to run when a projectile and
obstacle collide.  This code won't do anything, but it will return `false`.
This tells JetLag to ignore the interaction, instead of using it as an reason to
call the `reclaimer`.

```typescript
    stage.world.setGravity(0, 10);
    boundingBox();

    // Make a hero
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .4, cy: 0.4, radius: 0.4 }),
      role: new Hero(),
      gestures: { tap: () => { (h.role as Hero).jump(0, -10); return true; } }
    });

    // draw a bucket as three rectangles
    //
    // We want to make it so that when the ball hits the obstacle (the bucket),
    // it doesn't disappear. The only time a projectile does not disappear when
    // hitting an obstacle is when you provide custom code to run on a
    // projectile/obstacle collision, and that code returns false. In that case,
    // you are responsible for removing the projectile (or for not removing it).
    // That being the case, we can provide code that just returns false, and
    // that'll do the job.
    new Actor({
      appearance: new FilledBox({ width: 0.1, height: 1, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 8.95, cy: 3.95, width: 0.1, height: 1 }),
      role: new Obstacle({ projectileCollision: () => false }),
    });
    new Actor({
      appearance: new FilledBox({ width: 0.1, height: 1, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 10.05, cy: 3.95, width: 0.1, height: 1 }),
      role: new Obstacle({ projectileCollision: () => false }),
    });
    new Actor({
      appearance: new FilledBox({ width: 1.2, height: 0.1, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 9.5, cy: 4.4, width: 1.2, height: 0.1 }),
      role: new Obstacle({ projectileCollision: () => false }),
    });

    // Place an enemy in the bucket, and require that it be defeated
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 9.5, cy: 3.9, radius: 0.4 }),
      movement: new GravityMovement(),
      role: new Enemy({ damage: 4 }),
    });
    stage.score.setVictoryEnemyCount();

    // Set up a projectile pool so we can toss balls at the basket
    let projectiles = new ActorPoolSystem();
    for (let i = 0; i < 5; ++i) {
      let appearance = new ImageSprite({ width: 0.5, height: 0.5, img: "grey_ball.png", z: 0 });
      let rigidBody = new CircleBody({ radius: 0.25, cx: -100, cy: -100 });
      rigidBody.body.SetGravityScale(1); // turn on gravity
      rigidBody.setCollisionsEnabled(true); // Collisions count... this should bounce off the basket
      let reclaimer = (actor: Actor) => { projectiles.put(actor); }
      let role = new Projectile({ damage: 1, disappearOnCollide: true, reclaimer });
      let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement({ multiplier: 2 }), role });
      projectiles.put(p);
    }

    // cover "most" of the screen with a button for throwing projectiles.  This
    // ensures that we can still tap the hero to make it jump
    new Actor({
      appearance: new FilledBox({ width: 15, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8.5, cy: 4.5, width: 15, height: 9 }, { scene: stage.hud }),
      gestures: {
        tap: (_actor: Actor, hudCoords: { x: number; y: number }) => {
          let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
          let world = stage.world.camera.screenToMeters(pixels.x, pixels.y);
          let p = projectiles.get(); if (!p) return true;
          (p.role as Projectile).tossAt(h.rigidBody.getCenter().x, h.rigidBody.getCenter().y, world.x, world.y, h, 0, 0);
          return true;
        }
      }
    });

    // put a hint on the screen after 15 seconds to show where to click to ensure that
    // projectiles hit the enemy
    stage.world.timer.addEvent(new TimedEvent(15, false, () => {
      new Actor({
        appearance: new ImageSprite({ width: 0.2, height: 0.2, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 2.75, cy: 2.4, radius: 0.1 }, { collisionsEnabled: false }),
        role: new Obstacle({ projectileCollision: () => false }),
      });
    }));
```
