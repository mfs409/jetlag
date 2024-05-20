## Text Anchors

When making games (or writing any code), it's important not to just think about
what happens "when it works", but also "when it doesn't".  In games, this is a
more obvious point: sometimes the most important part of a game is what happens
when you lose... if you're not testing that, you're missing out on a key part of
the game!

Another example of this sort of detail-oriented thinking applies to our text
box.  How many times did you click it?  Did you notice what happened when you
clicked it 10 times?

Sometimes, we want our text to be in a fixed alignment on the screen.  That is,
we want the top left corner to stay the same, no matter how long the text gets.
We can achieve this by changing `center` to `false`.  Then JetLag will align the
center of the rigid body with the top-left corner of the text:

```typescript
{{#include game_05.ts:26:33}}
```

When we test this [game](game_05.ts), we see that we've solved one problem, but created
another.  Now the rigid body is in an inconvenient location.  The best way to
"fix" this problem is to have two actors: one for anchoring the text, one for
receiving taps.  The tap actor should probably be invisible (which you can
accomplish with a `FilledBox` whose color has an extra two digits for
transparency).

<iframe src="./game_05.iframe.html"></iframe>
