## Our First Projectiles

In the game below, pressing space will toss a projectile to the right.  As
you're testing this code, be sure to press and hold the space bar.  You'll
notice that you can get some unexpected behavior!

<iframe src="./game_01.iframe.html"></iframe>

Most of the code for this game should be familiar.  We'll start by making a
border and a hero who can move left and right:

```typescript
    boundingBox();
    stage.world.setGravity(0, 10);
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { density: 2, disableRotation: true }),
      movement: new ManualMovement(),
      role: new Hero(),
    });

    // set up arrow keys for the hero:
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(-5, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(5, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
```

We won't make an actor pool yet.  Instead, we'll say that every time the space
bar is pressed, we'll create a new projectile.  The projectile will appear 0.2
meters to the right of the hero.  Then we'll use `tossFrom()` to toss the
projectile to the right.  `tossFrom()` takes an actor, the x,y coordinates of a
position that is relative to the actor's center, and x,y values for a projectile
velocity.  That means we don't really need to care where we make the rigidBody:
our call to `tossFrom` will move it to a position that is .2 to the right of the
hero, and will make the projectile move to the right at a velocity of 5
meters/second.

```typescript
    // Note that you could have different buttons, or different keys, for
    // tossing projectiles in a few specific directions
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
      let p = new Actor({
        appearance: new ImageSprite({ width: .2, height: .2, img: "grey_ball.png" }),
        rigidBody: new CircleBody({ cx: hero.rigidBody.getCenter().x + .2, cy: hero.rigidBody.getCenter().y, radius: .1 }),
        movement: new ProjectileMovement(),
        role: new Projectile()
      });
      // We can use "tossFrom" to throw in a specific direction, starting at a
      // point, such as the hero's center.
      (p.role as Projectile).tossFrom(hero, .2, 0, 5, 0);
    });
```

One surprise you'll discover is that these projectiles have gravity, so they
start falling down.  Another is that they disappear when they collide with the
floor.  And, finally, you'll notice that they are colliding with the hero
(because we are starting them .2 to the right of the hero's center, but the
hero's radius is .4).  Every time we throw a projectile, Box2D sees that the
projectile is colliding with the hero, and it processes a collision.  This
pushes the hero left a little bit.  If you change the .2 in `tossFrom() to .4,
then this quirky behavior will go away.
