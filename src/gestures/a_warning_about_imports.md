## A Warning About Imports

In this tutorial, we'll encounter a few situations where JetLag expects you to
provide a `b2Vec2` object.  `b2Vec2` is the way that Box2D stores an x,y
coordinate.  You might find that VSCode has trouble determining what to import
in that code.  If so, you should paste this line at the top of your file:

```typescript
import { b2Vec2 } from "@box2d/core";
```
