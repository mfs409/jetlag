## IDLE_E: The Default Animation

Let's make our first animated sprite.  It will use the coin images from `sprites.png` to make a coin that rotates.  Here's [the code](game_08.ts), and here's what it looks like:

<iframe src="./game_08.iframe.html"></iframe>

The easiest way to make an animation is to use `AnimationSequence.makeSimple()`.
It lets us take a bunch of images and create a flipbook-style animation by
cycling through them one at a time, showing each for the same amount of time.
We can make an animation for our coins like this.  Since `repeat` is true, it
will restart once it reaches the end:

```typescript
{{#include game_08.ts:28:32}}
```

In JetLag, the default animation is `IDLE_E`.  Every `AnimatedSprite` needs to
have this.  But how do we get it to the actor?  It would be tedious to have to pass in 80 different animations, so instead we create a map.

Briefly, a map is like a phone book or dictionary: it lets us associate some
value with some other value (kind of like a name to a phone number, or a word to
its definition).  Our map will go from the different animation states to
`AnimationSequence`s.  For this example, we just need one animation, so it's
pretty easy:

```typescript
{{#include game_08.ts:34:35}}
```

Now that we've done that, we can make an actor whose appearance is an
`AnimatedSprite`:

```typescript
{{#include game_08.ts:38:41}}
```
