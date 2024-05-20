## When Projectiles Don't Disappear

In the following [game](game_07.ts), we don't always want our projectiles to
disappear. Watch what happens as you toss projectiles and they collide with
different obstacles.  Also, notice how a hint appears after a little while, and
how there's a way to jump-and-toss.

<iframe src="./game_07.iframe.html"></iframe>

Below is the code for this example.  If you've been following through the
chapter, there is probably only one thing that will surprise you.  We need to
get the projectile to "bounce off of" the bucket, instead of disappearing.

The way we do this is by providing custom code to run when a projectile and
obstacle collide.  This code won't do anything, but it will return `false`.
This tells JetLag to ignore the interaction, instead of using it as an reason to
call the `reclaimer`.

```typescript
{{#include game_07.ts:29:111}}
```
