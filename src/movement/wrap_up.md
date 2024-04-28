## Wrapping Up

To wrap up, let's make a block-breaking game.  In this game, there aren't really
any new JetLag ideas or concepts.  There is, however, some new TypeScript, like
using an array (`colors = [...]`), and using a `for` loop:

<iframe src="game_11.iframe.html"></iframe>

You'll also notice that it's possible to get "stuck", by hitting the ball in a
way that leads to it bouncing back and forth, left/right, without ever moving up
and down.  That's a natural consequence of physics.  Can you think of ways that
you could change the behavior of the left/right walls, or of the ball, or of
both, so that you could detect when this happened, and fix things up so that the
game remains fun?

```typescript
    boundingBox();

    // make a hero who is always moving, and who has a lot of elasticity
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 8, cy: 7, radius: 0.25 }, { elasticity: 1, friction: 0.1 }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    (h.movement as ManualMovement).addVelocity(0, 8);

    // make an obstacle and then connect it to some controls.  This will be the
    // paddle at the bottom
    let boxCfg = { cx: 8, cy: 8.75, width: 2, height: 0.5, fillColor: "#FF0000" };
    let o = new Actor({
      appearance: new FilledBox(boxCfg),
      // Note: friction is here and on the ball, so we can get spinning behavior
      rigidBody: new BoxBody(boxCfg, { density: 10, elasticity: 1, friction: 0.1 }),
      movement: new ManualMovement(),
      role: new Obstacle(),
    });

    // Draw some rows of blocks at the top
    let colors = ["#FF0000", "#FFFF00", "#FF00FF", "#00FF00", "#00FFFF", "#0000FF"];
    for (let r = .25; r < 4.25; r += .5) {
      for (let c = .5; c < 16; c += 1) {
        new Actor({
          appearance: new FilledBox({ width: 1, height: .5, fillColor: colors[Math.trunc(Math.random() * 6)] }),
          rigidBody: new BoxBody({ cx: c, cy: r, width: 1, height: .5 }, { density: 1 }),
          role: new Obstacle({ heroCollision: (thisActor: Actor) => thisActor.enabled = false })
        });
      }
    }

    // Set up the left/right arrow keys
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((o.movement as ManualMovement).updateXVelocity(-5)));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((o.movement as ManualMovement).updateXVelocity(5)));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => ((o.movement as ManualMovement).updateXVelocity(0)));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => ((o.movement as ManualMovement).updateXVelocity(0)));
```

If you've worked through this tutorial, you should have a good understanding of
both rigid bodies and movement.  But you're probably starting to have lots of
questions about collisions and roles.  We'll start looking into that in the next
tutorial.

