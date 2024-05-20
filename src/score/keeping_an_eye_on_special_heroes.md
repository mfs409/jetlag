## Keeping An Eye On Special Heroes

Sometimes there is one hero that is more important than the rest.  We can mark
that hero, so that the level ends in defeat as soon as that hero is defeated:

<iframe src="./game_14.iframe.html"></iframe>

In the code for this [game](game_14.ts), the rightmost hero must survive.  If
you manage to get the other hero to collide with the enemy first, the game won't
end... but as soon as the `mustSurvive` hero collides with the enemy, the level
ends.

```typescript
{{#include game_14.ts:37:55}}
```
