## Explicitly Controlling Movement With `ManualMovement`

Most of the movements we've looked at so far have been kind of automatic...
JetLag was in control. Now let's look at the last movement technique,
`ManualMovement`.  This is for when you want your code to have complete control
over the movement of the actor.

Let's start by making a world where an actor can just move around:

<iframe src="game_06.iframe.html"></iframe>

The hardest part of this code is that we need to set up all of the behaviors to
run on key presses and key releases.  The easy thing is to make the actor and
put it in a world with no gravity:

```typescript
    stage.world.setGravity(0, 0);
    boundingBox();

    // First, make the hero with ManualMovement as its movement component
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 4, cy: 8, radius: 0.25 }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
```

Then we can set up they keyboard.  We'll say that pressing a key should update
its velocity, and releasing should set that part of the velocity to 0:

```typescript
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(-5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(-5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(5)));

    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(0)));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(0)));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));

    // We'll use the 'a' and 's' keys to rotate counterclockwise and clockwise
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_A, () => (hero.movement as ManualMovement).increaseRotation(-0.05))
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_S, () => (hero.movement as ManualMovement).increaseRotation(0.05))
```

In the example, you'll notice that only one key works at a time.  So, for
example, if you hold `a` and start using the arrows, the green ball will stop
rotating.  This is a consequence of how web browsers work... we can talk about
ways to fix it later.

