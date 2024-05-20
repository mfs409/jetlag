## Wrapping Up

Some of the roles we discussed in this chapter are conveniences, whose behaviors
could be achieved just by using  `Obstacle` in special ways.  However, sometimes
it's convenient to use these roles... it means less code, and it means the code
is easier to read, because we can just see a word like "Goodie" and know exactly
what an actor is supposed to do.

Other roles, like Hero, Obstacle, and Enemy, are more advanced and robust than
the other roles.  As an exercise, you should think about how you could use
Obstacles in place of Goodies, Destinations, and Sensors.  Then you should try
to come up with a reason why you couldn't use Obstacles in place of Heroes or
Enemies.  If your understanding is very good, then you could even propose what
change JetLag would need in order for Obstacles to be able to serve as if they
were Heroes and Enemies.
