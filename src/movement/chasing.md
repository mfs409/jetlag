## Chasing An Actor

Another way of moving things is via "chase".  Chase isn't incredibly
complicated... we just cast a line from the chasing actor to the actor it is
chasing, and tell the chasing actor to move along that line.  Surprisingly, this
can seem like a really smart "AI" in some games.  Here's an example (and here is
its [code](game_03)):

<iframe src="game_03.iframe.html"></iframe>

In terms of writing the code, the only really interesting thing is how we make
the two actors:

```typescript
{{#include game_03.ts:34:48}}
```

Up to this point, when we made actors we usually just said `new Actor(...)`. But
here, when we make the hero (the one who is being chased), we say `let h = new
Actor(...)`.  We didn't have to call it `h`.  We could have called it `hero` or
`h123` or `the_hero_to_chase` or quite a few other things. What matters is that
we created a *variable* (that is, we made up a name for our code to use). In
later code, we can use that variable when we need to think about the hero. So,
when we made the `ChaseMovement`, we were able to say that the target of the
chase was `h`, and JetLag would know who to chase.
