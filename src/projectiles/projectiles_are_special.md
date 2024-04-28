## Projectiles Are Special

While projectiles do not *have* to move fast, they typically do.  This can
create big problems in Box2D, because physics simulations usually work by
looking at where everything is, computing where it should be in a short time,
and then checking for collisions. When actors move too fast, it's possible for
Box2D to miss the fact that things should have collided.  Fortunately, Box2D
provides a solution to the problem: We can mark a projectile's rigid body as
being a "bullet", and Box2D will do a more expensive computation for it, to
catch these possible glitches.  When you make a `Projectile` role, JetLag
handles this configuration for the corresponding actor's rigid body.

However, there's another problem.  In a lot of games, it's possible to toss
*lots* of projectiles.  What happens if those projectiles go off screen?  It
would be no fun if you could toss a projectile at the beginning of a level, and
it could move hundreds of meters forward, hitting the boss before you even get
to it.  And it would probably break your game if Box2D had to manage thousands
of projectiles, each requiring the expensive computation described above.

The first way that JetLag deals with this is by having *both* a projectile role
and a projectile movement.  In almost every game, you'll the actors serving as
projectiles to have both of these components.  The second thing you'll want to
do is create an "Actor Pool" for your projectiles.
