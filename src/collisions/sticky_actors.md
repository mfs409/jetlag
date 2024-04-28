## Sticky Actors

It can be useful to make a hero stick to an actor.  As an example, if the hero
should stand on a platform that moves along a path, then physics says that the
hero will slide on the platform as it moves left/right (unless there is a lot of
friction), and the hero will "bounce" when the platform goes from moving upward
to moving downward.  In the following example, you should move the hero onto
each platform, and watch how its behavior changes.

<iframe src="./game_01.iframe.html"></iframe>

To make this example, we'll start by setting up some gravity and a hero.  The
hero can move left/right via the arrow keys, and can jump via the space bar:

```typescript
    stage.world.setGravity(0, 10);
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { density: 2, disableRotation: true }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (hero.role as Hero).jump(0, -7.5); });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(-5, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(5, hero.rigidBody.getVelocity().y); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
```

Now we'll make a platform that moves in a diamond shape.  This platform is
sticky on top, via the `stickySides` argument to its rigid body

```typescript
    new Actor({
      appearance: new FilledBox({ width: 2, height: 0.25, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 2, cy: 6, width: 2, height: 0.25 }, { stickySides: [Sides.TOP], density: 100, friction: 0.1 }),
      movement: new PathMovement(new Path().to(2, 6).to(4, 8).to(6, 6).to(4, 4).to(2, 6), 1, true),
      role: new Obstacle(),
    });
```

Now we'll make another platform, without stickiness.  You should try to use
friction (on the hero and platform) to avoid the sliding and bouncing behaviors.
You'll probably find that it's too hard to get it to work nicely while still
having the rest of the hero movement the way you want it.

```typescript
    new Actor({
      appearance: new FilledBox({ width: 2, height: 0.25, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 11, cy: 6, width: 2, height: 0.25 }, { density: 100, friction: 1 }),
      movement: new PathMovement(new Path().to(10, 6).to(12, 8).to(14, 6).to(12, 4).to(10, 6), 1, true),
      role: new Obstacle(),
    });
```

You can make several a different side sticky, by using `Sides.BOTTOM`,
`Sides.RIGHT`, or `Sides.LEFT`.  You can also put several sides into the
`stickySides` array, by separating each with a comma.
