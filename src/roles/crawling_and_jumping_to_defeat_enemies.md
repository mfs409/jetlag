## Crawling And Jumping To Defeat Enemies

In JetLag, you can use jumping and crawling as ways to defeat enemies without
losing strength.

<iframe src="game_15.iframe.html"></iframe>

In the code below, crawling is like jumping: it is a behavior attached to the
`Hero` role, not to its movement.  That means we can use `Tilt` to move the
Hero, and still get crawling and jumping behaviors.  Let's start by setting up
gravity and making the hero:

```typescript
    stage.world.setGravity(0, 10);
    let hero = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new BoxBody({ cx: 2, cy: 3, width: 0.8, height: 0.8 }, { density: 2 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
```

Next, we'll add two enemies.  We use `defeatByCrawl` and `defeatByJump` to
indicate that a hero who is crawling upon collision, or in the air upon
collision, can defeat the enemy without taking any damage.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 8.6, radius: 0.4 }),
      role: new Enemy({ defeatByCrawl: true, }),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 14, cy: 8.6, radius: 0.4 }),
      role: new Enemy({ defeatByJump: true }),
    });
```

Finally, we'll set up `SPACE` as the key for jumping, and `TAB` as the key for
crawling.

```typescript
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (hero.role as Hero).jump(0, -7.5); });

    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_TAB, () => { (hero.role as Hero).crawlOn(Math.PI / 2); });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_TAB, () => { (hero.role as Hero).crawlOff(Math.PI / 2); });
```

It's important to remember that while JetLag calls the feature "crawl", with the
right change in graphics, this could be crawling, ducking, rolling, spinning, or
other behaviors.
