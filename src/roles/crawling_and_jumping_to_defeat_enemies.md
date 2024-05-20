## Crawling And Jumping To Defeat Enemies

In JetLag, you can use jumping and crawling as ways to defeat enemies without
losing strength.

<iframe src="game_15.iframe.html"></iframe>

In the [code](game_15.ts) below, crawling is like jumping: it is a behavior attached to the
`Hero` role, not to its movement.  That means we can use `Tilt` to move the
Hero, and still get crawling and jumping behaviors.  Let's start by setting up
gravity and making the hero:

```typescript
{{#include game_15.ts:38:44}}
```

Next, we'll add two enemies.  We use `defeatByCrawl` and `defeatByJump` to
indicate that a hero who is crawling upon collision, or in the air upon
collision, can defeat the enemy without taking any damage.

```typescript
{{#include game_15.ts:46:56}}
```

Finally, we'll set up `SPACE` as the key for jumping, and `TAB` as the key for
crawling.

```typescript
{{#include game_15.ts:58:61}}
```

It's important to remember that while JetLag calls the feature "crawl", with the
right change in graphics, this could be crawling, ducking, rolling, spinning, or
other behaviors.
