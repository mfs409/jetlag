## Using An Actor Pool

Now we'll add an actor pool, and pre-populate it with 10 projectiles.  At first,
this feels exactly the same as our last example, but then we run out of
projectiles!

<iframe src="./game_02.iframe.html"></iframe>

Similarly, most of the code is the same.  Here's the part for setting up the
hero, world, and hero movement:

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

The differences only deal with the projectiles.  We start by making a pool (an
`ActorPoolSystem`) and putting ten projectiles in it.  Notice that the x,y
coordinates don't really matter, so I opted to draw them off screen.  When we
put actors in a pool, they will automatically be disabled; when we take them
out, they'll be re-enabled.  Thus they won't be expensive for Box2D to manage.

```typescript
    // Make a pool with 10 projectiles
    let projectiles = new ActorPoolSystem();
    for (let i = 0; i < 10; ++i) {
      // Where we put them doesn't matter, because the pool will disable them
      let p = new Actor({
        appearance: new ImageSprite({ width: .2, height: .2, img: "grey_ball.png" }),
        rigidBody: new CircleBody({ cx: -10, cy: -10, radius: .1 }),
        movement: new ProjectileMovement(),
        role: new Projectile()
      });
      projectiles.put(p);
    }
```

When we want to toss a projectile, we use `projectiles.get()` to get it.  If the
pool is empty, this will return `undefined`, so we do a quick check (`if (p)`
means the same thing as `if (p != undefined)`), and only toss the projectile if
it is valid:

```typescript
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
      let p = projectiles.get();
      if (p) (p.role as Projectile).tossFrom(hero, .2, 0, 5, 0);
    });
```
