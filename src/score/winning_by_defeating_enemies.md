## Winning By Defeating Enemies

The `stage.score` object tracks how many enemies have been created, and how many
have been defeated.  This gives us two distinct win conditions.  We can win by
defeating "all" of the enemies (which is useful when timers or other events add
enemies to the game while it is being played), or we can win by defeating a
certain number of enemies.

As for *how* to defeat enemies, there are a few built-in ways.  In this example,
the hero has a lot of strength, which means it can defeat enemies by colliding
with them:

<iframe src="./game_03.iframe.html"></iframe>

Before reading the code, you should try to write this level all by yourself.
Then take a look and see how your code compares to mine.  One thing to keep in
mind is that `stage.score.setVictoryEnemyCount()` can be called with no
arguments, or with a number, so if we don't provide a number, then "all" of the
enemies will need to be defeated.

```typescript
    // Defeat all the enemies via collision
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 10 })
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 3.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
    });
    stage.score.setVictoryEnemyCount();
```

We can also use invincibility as a way to defeat enemies.  You'll recall from
the "Animations" tutorial that we can animate a hero while it is invincible.  We
can also put some text on the screen, or change the music, to indicate that the
hero is invincible.  In this level, I didn't do that, so you'll have to guess
about how much time you still have to defeat the enemies after collecting the
goodie.  Also, notice that the code explicitly says "you must defeat 2 enemies".

<iframe src="./game_04.iframe.html"></iframe>

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero({ strength: 1 }) // Not enough strength to defeat anyone!
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
      rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
      role: new Goodie({ onCollect: (_g: Actor, h: Actor) => { (h.role as Hero).invincibleRemaining = 10; return true; } }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 3.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
    });
    stage.score.setVictoryEnemyCount(2);
```

JetLag also has a notion of "crawling".  You can think of it as crawling,
crouching or whatever else makes sense.  Defeating an enemy via crawling may
seem like a strange idea, but sometimes you'll find that you want to require the
player to crawl to get through a space.  Placing an enemy in the space, and
letting the hero defeat it via crawling, is a natural way to achieve the desired
effect.

<iframe src="./game_05.iframe.html"></iframe>

In the code, you'll see that the space bar makes the hero crawl.  JetLag lets
you rotate the hero while it is crawling.  You might instead want to resize it.
There are also options to use a special animation while crawling.

```typescript
    let h = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero()
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).crawlOn(Math.PI / 2))
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).crawlOff(Math.PI / 2))
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Enemy({ defeatByCrawl: true }),
    });
    stage.score.setVictoryEnemyCount(1);
```

It's also possible to defeat an enemy by jumping onto it:

<iframe src="./game_06.iframe.html"></iframe>

Just as the previous example used `defeatByCrawl: true`, this uses
`defeatByJump`.  You could even use both, if that made sense in your game.

```typescript
    stage.world.setGravity(0, 10);
    let h = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero()
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -7.5))
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Enemy({ defeatByJump: true }),
    });
    stage.score.setVictoryEnemyCount(1);
```

Continuing with our theme of "how to defeat enemies", the main use of the
projectile role is to give the player something to toss at enemies, to reduce
their damage.  In the example below, the space bar will toss projectiles
rightward:

<iframe src="./game_07.iframe.html"></iframe>

When you do the tutorial about projectiles, you'll learn more about how they
work.  You'll also learn about `ActorPool`... you should never use projectiles
without an `ActorPool`!

In the example below, we only have one way to throw projectiles.  You might want to try adding another button, or a different key, for tossing projectiles in another direction.

```typescript
    let h = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      movement: new TiltMovement(),
      role: new Hero()
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
      let p = new Actor({
        appearance: new ImageSprite({ width: .2, height: .2, img: "grey_ball.png" }),
        rigidBody: new CircleBody({ cx: h.rigidBody.getCenter().x + .2, cy: h.rigidBody.getCenter().y, radius: .1 }),
        movement: new ProjectileMovement(),
        role: new Projectile()
      });
      // We can use "tossFrom" to throw in a specific direction, starting at a
      // point, such as the hero's center.
      (p.role as Projectile).tossFrom(h, .2, 0, 5, 0);
    });
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
    });
    stage.score.setVictoryEnemyCount(1);
```

Finally, when all else fails, we can defeat an enemy via code that we write.  In
the example below, we'll say that tapping an enemy defeats it.  Note that you
could use an obstacle collision, or a timer, or any event as the trigger for
defeating an enemy.

<iframe src="./game_08.iframe.html"></iframe>

In the code below, you'll notice that one enemy is defeated via `defeat(false)`,
and the other via `defeat(true)`.  This is an important distinction.  If your
game has a boss who must be defeated, and other enemies who don't really matter,
then you could use `false` for all but the boss.  Another option would be to use
the `onDefeated` feature of the Enemy role to automatically win when the boss
was defeated.

```typescript
    // Defeating this one doesn't actually count!
    const e = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
      gestures: { tap: () => { (e.role as Enemy).defeat(false); return true; } }
    });
    // This one does count.  Be sure to watch the counter as you defeat it.
    const e2 = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 5.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
      gestures: { tap: () => { (e2.role as Enemy).defeat(true); return true; } }
    });
    stage.score.setVictoryEnemyCount(1);
```
