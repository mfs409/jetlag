## Disabling Collisions From One Side

In some games, we want one kind of actor to be able to "pass through" another.
For example, in this level, each of the red walls can be passed through from
three sides.  This means the hero can go through the wall in one direction, and
not the other.

<iframe src="./game_02.iframe.html"></iframe>

In the code for this level, each of the red walls uses `singleRigidSide` to pick
just one side that stays rigid.  The result is a sort of "box" on the screen
that is easy to get inside, and harder to get out of.

```typescript
    enableTilt(10, 10);

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4, }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new FilledBox({ width: 3, height: 0.2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 4.5, cy: 3.1, width: 3, height: 0.2 }, { singleRigidSide: Sides.BOTTOM }),
      role: new Obstacle(),
    });

    new Actor({
      appearance: new FilledBox({ width: 0.2, height: 3, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 3.1, cy: 4.5, width: 0.2, height: 3 }, { singleRigidSide: Sides.RIGHT }),
      role: new Obstacle(),
    });

    new Actor({
      appearance: new FilledBox({ width: 0.2, height: 3, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 5.9, cy: 4.5, width: 0.2, height: 3 }, { singleRigidSide: Sides.LEFT }),
      role: new Obstacle(),
    });

    new Actor({
      appearance: new FilledBox({ width: 3, height: 0.2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 4.5, cy: 7.5, width: 3, height: 0.2 }, { singleRigidSide: Sides.TOP }),
      role: new Obstacle(),
    });
```

There are many possibilities for this sort of wall.  For example, you might want
a trap door, or a platform that can be "jumped through".
