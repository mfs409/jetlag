## A Game is Like an Interactive Play

At this point, we've looked at everything except the code that actually makes
our game different from any other game.  Part of what makes JetLag approachable
is the way it organizes code.  JetLag organizes everything around the metaphor
of a theater production.

It is helpful to think about a game in the same way you might think about
filming the kind of play where the actors get input from the audience.  The
first thing that you will need is to have a stage, which is where all the action
happens. That stage can be thought of as the place where some fictional "world"
comes to life.

On that stage, you will need to put some actors.  They're going to do the things
that make the game fun to play / make the play entertaining to watch.  The stage
will probably also have some props on it.  It turns out that in games, the line
between actors and props is kind of blurry, so we're just going to call
everything an actor.

Each level of your game is like an act or scene of the play.  When a level
starts, some actors will be pre-positioned on the stage.  They'll start doing
whatever the script says that they should do.  Then events will happen, which
drive the action forward.  

In JetLag, our focus is on the kind of games where a physics simulator (Box2D)
drives the action forward.  So in the above paragraph, "whatever the script says
that they should do" really means "whatever the physics simulator says they
should do".  If an actor is initially configured to be stationary, it won't
move.  If it's configured to move at a fixed speed, or fall from the sky,
subject to some gravitational force, then that's what it will do.

If that's all we have, then your game won't be very fun... it will play the
exact same way, every time, and will completely ignore whatever the person
playing the game is trying to do.  *Events* are the way that we interrupt the
simulation and change it.  In JetLag, there are three kinds of events:

- Collisions: When two actors collide with each other, you can use that
  collision as an opportunity to run some code.
- Timers: You can request that some code run after a certain amount of time
  elapses.
- User input: You can provide code to run in response to user gestures, clicks,
  keyboard presses, etc.

In the rest of this book, the terms "script" and "callback" will be used
interchangeably to refer to the code that you provide, that runs in response to
events.  The purpose of that code is to change the state of the physics
simulation.

Surprisingly, that's all there is to a game.  It's just a physics simulation
that you can interact with.  You can think of it like a play, where the "player"
is an audience member who can change what happens in the play.
