## Tap: The Most Basic Gesture

Tapping is the most straightforward gesture.  When the device running your game
supports touch, tap represents a touch and release of the touch screen.
Otherwise, it is accomplished by clicking and releasing while your mouse is over
a specific actor.

The big question when setting up tap is "what should be tappable".  It's easy to
think "the actor", but if an actor moves around a lot, then it might be hard to
tap.  Especially for mobile devices, sometimes the right answer is to just cover
the whole screen with a button.

<iframe src="./game_01.iframe.html"></iframe>

In this mini-game, you need to jump and collide with the destination.  If you
miss it, you'll keep moving to the right, and you'll collide with an invisible
enemy, causing the level to restart.  The whole screen is tappable.

We start the level by creating a bounding box, setting up gravity, and making a
hero who is always moving:

```typescript
    boundingBox();
    stage.world.setGravity(0, 10);

    // A hero who can jump and who is moving
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 8.5, radius: 0.4 }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    (hero.movement as ManualMovement).setAbsoluteVelocity(5, 0);
```

Next, we can add the destination and an enemy:

```typescript
    // A destination to reach
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 11, cy: 6, radius: 0.4 }),
      role: new Destination(),
    });

    // If you don't make it, you'll lose
    new Actor({
      appearance: new FilledBox({ width: .1, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 15.95, cy: 4.5, width: .1, height: 9 }),
      role: new Enemy(),
    });
```

Finally, we make the button:

```typescript
    new Actor({
      appearance: new FilledBox({ width: 0.1, height: 0.1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
      gestures: { tap: () => { (hero.role as Hero).jump(0, -7.5); return true; } }
    });
```
