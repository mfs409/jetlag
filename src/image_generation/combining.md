## Combining Textures Into A Sprite

As a quick reminder, since we're using a new spritesheet, we need to be sure to
load it in our config:

```typescript
{{#include game.ts:3:17}}
```

Then we can start building our character.  As a first step, let's just combine
the body and arms into a texture:

```typescript
{{#include game.ts:25:32}}

{{#include game.ts:53:54}}
```

Now that we have the texture, we can use it to make an `ImageSprite` and an
`Actor`.  In this code, our original character image (before we split it up) was
123x187 pixels.  I don't want to mess up the aspect ratio, so I'll do some math
in the `appearance` and `rigidBody`.

```typescript
{{#include game.ts:56:64}}
```

In that code, you'll notice that I created an `ImageSprite` with a texture,
instead of an image filename.  JetLag can tell the difference between file names
and textures, and will know how to do the right thing with this code.
