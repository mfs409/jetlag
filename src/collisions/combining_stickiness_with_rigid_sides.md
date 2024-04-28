## Combining Stickiness With Rigid Sides

In this next example, we do a quick test to make sure that the ideas we've seen
so far *compose*.  It should be possible to jump through the bottom of the
leftmost platform, and then stick to its top:

<iframe src="./game_04.iframe.html"></iframe>

Compared to before, the only difference from before is when we make the rigid
body for the platform on the left:

```typescript
      rigidBody: new BoxBody({ cx: 2, cy: 6, width: 2, height: 0.25, }, { stickySides: [Sides.TOP], singleRigidSide: Sides.TOP, density: 100, friction: 0.1 }),
```
