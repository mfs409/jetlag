## Stacking Appearances

There's one last thing that it is good to think about when considering text and
the heads-up display.  In many games, it we need to be able to move text and an
image *together*.  For example, if you wanted to have a menu "fly in" from the
side of the screen, it would be odd if the menu box and the menu words moved
separately.

In JetLag, an actor's appearance is actually an *array*.  That means the actor
can have several appearance components, all stacked atop each other.

Here's an example:

<iframe src="./game_09.iframe.html"></iframe>

The code to put this together appears below.  You'll notice that we just use the
`[]` syntax to provide two appearance components while making the actor.

```typescript
{{#include game_09.ts}}
```
