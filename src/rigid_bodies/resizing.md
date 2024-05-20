## Resizing Actors

Rigid bodies can be resized at any time.  This means you can make things grow
and shrink slowly, by using a timer to make incremental changes to size, or you
can make things grow and shrink instantly (for example, in Super Mario Bros,
when "big Mario" takes damage, it becomes "little Mario").

It's important to resize both the appearance and rigidBody, so JetLag has a
`resize` method on actors.  Calling it will result in both the appearance and
rigidBody being resized.  This works for all kinds of rigidBody shapes, and all
kinds of appearances, so in the following example, we make lots of different
combinations of shape and appearance.  Tapping red things will make them shrink.
Tapping blue things will make them grow.  You'll notice that resizing doesn't
always work the way you'd think.  It's important to play around with your code
until you find a good compromise between things behaving correctly and looking
right.

<iframe src="./game_08.iframe.html"></iframe>

The code below suffers from a lot of copy-and-paste.  While I usually think it
is a good idea to read every line, and to re-type code from these chapters into
your own game, this is probably a case where it's fine to just make sure you
understand one or two actors, and then copy the rest of the code and try it out.

```typescript
{{#include game_08.ts}}
```
