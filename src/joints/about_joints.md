## About Joints

Joints are a physics-based concept for connecting rigid bodies together.  Box2D
provides many kinds of joints.  We actually saw one already: our "sticky" actors
achieved their stickiness by creating joints.  In that case, JetLag used a
`distanceJoint`, to keep the two actors an exact distance apart from each other.

Joints can be hard to understand, and there really isn't much of a way for
JetLag to hide the joint infrastructure provided by Box2D.  If you are hoping to
do anything advanced with joints, you'll probably want to start by visiting
online Box2D documentation, such as this [Box2D Joint
Overview](https://www.iforce2d.net/b2dtut/joints-overview).  Then you should
look at how the JetLag code uses joints (that is, look at the parts of JetLag
that are used by the code in this chapter).  Hopefully that will be enough of a
starting point.
