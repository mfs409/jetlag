# Roles that Actors Play

In JetLag, actors take on roles, like "Hero" or "Obstacle".  This tutorial
discusses the "Goodie", "Destination", and "Sensor" roles.  

Each role in JetLag has several purposes.  For starters, each role defines
things that it does and does not appear to collide with.  For example, Passive
(the default role, which an actor takes if you don't give it anything else)
actors never collide with each other.  In addition, the roles we study in *this*
tutorial are defined in large part by what happens when a hero collides with
them.  Other roles bring in new ideas and features, which we'll discuss in later
tutorials.

This tutorial continues the discussion of roles that actors can play, by
covering the Obstacle and Enemy roles.  Along the way, we'll learn more about
heroes.

@@red Note@@ There is another role, `Projectile`, that is very common in JetLag.
It's special, so we'll leave its discussion to a tutorial that's all about
projectiles.
