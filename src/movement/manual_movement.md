## Explicitly Controlling Movement With `ManualMovement`

Most of the movements we've looked at so far have been kind of automatic...
JetLag was in control. Now let's look at the last movement technique,
`ManualMovement`.  This is for when you want your code to have complete control
over the movement of the actor.

Let's start by making a world where an actor can just move around:

<iframe src="game_06.iframe.html"></iframe>

Here's the [whole file](game_06.ts).  The hardest part of this code is that we
need to set up all of the behaviors to run on key presses and key releases.  The
easy thing is to make the actor and put it in a world with no gravity:

```typescript
{{#include game_06.ts:28:37}}
```

Then we can set up they keyboard.  We'll say that pressing a key should update
its velocity, and releasing should set that part of the velocity to 0:

```typescript
{{#include game_06.ts:41:53}}
```

In the example, you'll notice that only one key works at a time.  So, for
example, if you hold `a` and start using the arrows, the green ball will stop
rotating.  This is a consequence of how web browsers work... we can talk about
ways to fix it later.
