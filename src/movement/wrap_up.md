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
{{#include game_11.ts}}
```

If you've worked through this chapter, you should have a good understanding of
both rigid bodies and movement.  But you're probably starting to have lots of
questions about collisions and roles.  We'll start looking into that soon, but
first, we'll learn some tricks for working with graphical assets more easily.
