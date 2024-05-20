## Disabling Collisions From One Side

In some games, we want one kind of actor to be able to "pass through" another.
For example, in this level, each of the red walls can be passed through from
three sides.  This means the hero can go through the wall in one direction, and
not the other.

<iframe src="./game_02.iframe.html"></iframe>

In the [code](game_02.ts) for this level, each of the red walls uses `singleRigidSide` to pick
just one side that stays rigid.  The result is a sort of "box" on the screen
that is easy to get inside, and harder to get out of.

```typescript
{{#include game_02.ts:29:63}}
```

There are many possibilities for this sort of wall.  For example, you might want
a trap door, or a platform that can be "jumped through".
