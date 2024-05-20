## Losing When All Heroes Are Defeated

Since the roles in JetLag center around the idea of heroes, any time a hero is
defeated, JetLag will check if all heroes have been defeated, and if so, the
level will end.

<iframe src="./game_13.iframe.html"></iframe>

In this [game](game_13.ts), we won't bother with providing a way to win.

```typescript
{{#include game_13.ts:37:54}}
```

Strictly speaking, we don't need to tell JetLag about losing... once both heroes
collide with the enemy, the level will end.  Still, it's a good idea to tell
JetLag what the win condition is, even if it's not possible:

```typescript
{{#include game_13.ts:55}}
```
