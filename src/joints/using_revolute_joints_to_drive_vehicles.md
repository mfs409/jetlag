## Using Revolute Joints To Drive Vehicles

In the following example, Box2D is doing a lot of work.  The wheels of the car
are not just spinning as a visual effect.  They are actually propelling the car
forward.  This requires friction, careful consideration about the weights of
things, and two revolute joints with motors.  Note that since JetLag only
supports one revolute joint per actor, we put the joints on the wheels, not on
the body of the car.

<iframe src="./game_03.iframe.html"></iframe>

In terms of how we get this behavior, all that really matters is that we don't
put any limits on the revolute joints.  That means they can keep spinning, just
like real tires, instead of halting when they reach some angle.

In the code for this example, we'll start by setting up gravity and a border.
We'll add friction to the bottom of the border:

```typescript
{{#include game_01.ts:24:29}}
```

Next, we make the car as two wheels and a rectangle:

```typescript
{{#include game_01.ts:31:43}}
{{#include game_01.ts:47:52}}
```

All that remains is to set up joints that connect the wheels to the body of the
car.  This car has all-wheel drive, because both wheels have motors.  You should
try different motor speeds, different torques, and front or rear-wheel drive (by
only giving one wheel or the other a motor).

```typescript
{{#include game_01.ts:44:45}}

{{#include game_01.ts:53:54}}
```
