## Reclaiming Projectiles Based On Distance

In the previous example, we cheated by putting a border around the screen.  That
doesn't really work for side-scrolling games.  This example uses a different
strategy.  It also shows how projectile damage and enemy damage relate:

<iframe src="./game_05.iframe.html"></iframe>

We start this level by making a border, setting up gravity, and making a hero
who can move:

```typescript
    boundingBox();
    stage.world.setGravity(0, 10);
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { density: 2, disableRotation: true }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(-5, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(5, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
```

Next, we'll make some enemies that we can defeat.  Their damage amounts will
vary, so that it will take different numbers of projectiles to defeat them:

```typescript
    // draw some enemies to defeat
    for (let i = 0; i < 5; i++) {
      new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
        rigidBody: new CircleBody({ cx: 2 + 2 * i, cy: 8.5, radius: 0.5 }),
        role: new Enemy({ damage: i + 1 }),
      });
    }
```

We'll use the space bar to toss projectiles, using the `tossFrom()` technique.
To make the game feel a bit more fun, we'll randomly change the projectile image
when we throw it.  (@@red Note: this only works because we'll make sure each of
our projectiles has exactly one `AppearanceComponent`, and that each of those is an `ImageSprite`!@@)

```typescript
    let images = ["color_star_1.png", "color_star_2.png", "color_star_3.png", "color_star_4.png"];
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
      let p = projectiles.get();
      if (!p) return;
      (p.appearance[0] as ImageSprite).setImage(images[Math.trunc(Math.random() * 4)]);
      (p.role as Projectile).tossFrom(hero, .2, 0, 5, 0);
      p.rigidBody.body.SetAngularVelocity(4);
    });
```

The last step is to create our pool of projectiles.  We'll only make three, but
with no limit, we'll be able to reuse them as much as we want.

```typescript
    // set up the pool of projectiles
    let projectiles = new ActorPoolSystem();
    for (let i = 0; i < 3; ++i) {
      let appearance = new ImageSprite({ img: "color_star_1.png", width: 0.5, height: 0.5, z: 0 });
      let rigidBody = new CircleBody({ radius: 0.25, cx: -100, cy: -100 });
      rigidBody.setCollisionsEnabled(false);
      let reclaimer = (actor: Actor) => { projectiles.put(actor); }
      let role = new Projectile({ damage: 2, disappearOnCollide: true, reclaimer });
      // Put in some code for eliminating the projectile quietly if it has
      // traveled too far
      let range = 5;
      role.prerenderTasks.push((_elapsedMs: number, actor?: Actor) => {
        if (!actor) return;
        if (!actor.enabled) return;
        let role = actor.role as Projectile;
        let body = actor.rigidBody.body;
        let dx = Math.abs(body.GetPosition().x - role.rangeFrom.x);
        let dy = Math.abs(body.GetPosition().y - role.rangeFrom.y);
        if ((dx * dx + dy * dy) > (range * range)) reclaimer(actor);
      });
      let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement(), role });
      p.rigidBody.body.SetGravityScale(0);
      projectiles.put(p);
    }

```

In the configuration of these projectiles, we use a new feature of the role:
`prerenderTasks`.  It is a collection of functions.  While it's possible to put
many `prerenderTasks` on each projectile, it's usually best to just have one,
because we have to run each of them for each projectile that has them.  They run
on each clock tick, *before* we update the world.  

Every time we toss a projectile, its `rangeFrom` field will hold the initial
point from which the projectile was tossed. In this code, the task is using the
Pythagorean theorem to figure out if the projectile has moved more than `range`
meters away from that point, in which case we reclaim it.  Notice that you could
use `hero.rigidBody.cx` and `hero.rigidBody.cy` if you wanted to think about the
hero's current location, instead.  That would make more sense if we were just
worried about things going off-screen.

One last note: you probably remember that the Pythagorean theorem says:

$$
c^2 = a^2 + b^2
$$

That implies that the distance formula is:

$$
c = \sqrt{a^2 + b^2}
$$

Our code doesn't bother to take the square root.  Instead, it uses the square of
the range (`range * range`).  The result is the same, but square roots are
expensive to compute.  Since we don't need it, we don't bother.
