import { Actor, BoxBody, CircleBody, FilledBox, FilledCircle, JetLagGameConfig, Obstacle, b2RevoluteJointDef, b2Vec2, initializeAndLaunch, stage } from "../jetlag";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 32, height: 18 };
  hitBoxes = true;
}

/**
 * Draw a ragdoll on the screen, and give it some movement
 *
 * @param headCx The X coordinate of the ragdoll's head
 * @param headCy The Y coordinate of the ragdoll's head
 * @param vx     The X velocity of the ragdoll
 * @param vy     The Y velocity of the ragdoll
 * @param va     The angular velocity of the ragdoll
 */
function makeRagDoll(headCx: number, headCy: number, vx: number, vy: number, va: number) {
  // Make the head
  const HR = 0.65; // head radius
  let head = new Actor({
    appearance: new FilledCircle({ radius: HR, fillColor: "#FFFF00" }),
    rigidBody: new CircleBody({ cx: headCx, cy: headCy, radius: HR }, { density: 1, friction: .4, elasticity: .3, dynamic: true }),
    role: new Obstacle()
  });
  // Make the torso
  const TW = 1.80; // torso width
  const TH = 2.40; // torso height
  let torso = new Actor({
    appearance: new FilledBox({ width: TW, height: TH, fillColor: "#FFFF00" }),
    rigidBody: new BoxBody({ width: TW, height: TH, cx: head.rigidBody.getCenter().x, cy: head.rigidBody.getCenter().y + HR + TH / 2 }, { density: 1, friction: .4, elasticity: .1, dynamic: true }),
    role: new Obstacle()
  });

  // Make the arms
  const AW = 1.80; // arm width
  const AH = 0.55; // arm height
  let lArm = new Actor({
    appearance: new FilledBox({ width: AW, height: AH, fillColor: "#FFFF00" }),
    rigidBody: new BoxBody({ width: AW, height: AH, cx: torso.rigidBody.getCenter().x - TW / 2 - AW / 2 - .05, cy: torso.rigidBody.getCenter().y - TH / 2 + AH / 2 + .05 }, { density: 1, friction: .4, elasticity: .1, dynamic: true }),
    role: new Obstacle()
  });
  let rArm = new Actor({
    appearance: new FilledBox({ width: AW, height: AH, fillColor: "#FFFF00" }),
    rigidBody: new BoxBody({ width: AW, height: AH, cx: torso.rigidBody.getCenter().x + TW / 2 + AW / 2 + .05, cy: torso.rigidBody.getCenter().y - TH / 2 + AH / 2 + .05 }, { density: 1, friction: .4, elasticity: .1, dynamic: true }),
    role: new Obstacle()
  });

  // Make the legs
  const LW = 0.50; // leg width
  const LH = 1.80; // leg height
  let lLeg = new Actor({
    appearance: new FilledBox({ width: LW, height: LH, fillColor: "#FFFF00" }),
    rigidBody: new BoxBody({ width: LW, height: LH, cx: torso.rigidBody.getCenter().x - TW / 2 + LW / 2, cy: torso.rigidBody.getCenter().y + TH / 2 + LH / 2 + .09 }, { density: 1, friction: .4, elasticity: .1, dynamic: true }),
    role: new Obstacle()
  });
  let rLeg = new Actor({
    appearance: new FilledBox({ width: LW, height: LH, fillColor: "#FFFF00" }),
    rigidBody: new BoxBody({ width: LW, height: LH, cx: torso.rigidBody.getCenter().x + TW / 2 - LW / 2, cy: torso.rigidBody.getCenter().y + TH / 2 + LH / 2 + .09 }, { density: 1, friction: .4, elasticity: .1, dynamic: true }),
    role: new Obstacle()
  });

  // Join head to torso
  join(torso, 0, -TH / 2 - .02, head, 0, HR + .02, -25, 25);
  // Join arms to torso
  join(torso, -TW / 2 - .02, -TH / 2 + AH / 2, lArm, AW / 2 + .02, AH / 2, -95, 35);
  join(torso, TW / 2 + .02, -TH / 2 + AH / 2, rArm, -AW / 2 + -.02, AH / 2, -35, 95);
  // Join legs to torso
  join(torso, -TW / 2 + LW / 2, TH / 2 + .01, lLeg, 0, -LH / 2 - .01, -40, 40);
  join(torso, TW / 2 - LW / 2, TH / 2 + .01, rLeg, 0, -LH / 2 - .01, -40, 40);

  // Toss the torso to make the whole body move
  torso.rigidBody.setVelocity(new b2Vec2(vx, vy));
  torso.rigidBody.body.SetAngularVelocity(va);
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Drop a few ragdolls to see what happens
  makeRagDoll(5, 1, 10, -10, 2);
  makeRagDoll(5, -10, 0, 0, 0);
  makeRagDoll(28, -10, 0, 0, 100);

  // Floor
  new Actor({
    appearance: new FilledBox({ width: 32, height: 1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: 18.5, width: 32, height: 1 }),
    role: new Obstacle()
  });

  // Left stairs
  for (let i = 1; i < 11; ++i) {
    new Actor({
      appearance: new FilledBox({ width: i, height: 1, fillColor: "#0000ff" }),
      rigidBody: new BoxBody({ cx: i / 2, cy: 7 + i + .5, width: i, height: 1 }, { density: 1, elasticity: .3, friction: .4 }),
      role: new Obstacle()
    });
  }

  // Right stairs
  for (let i = 1; i < 11; ++i) {
    new Actor({
      appearance: new FilledBox({ width: i, height: 1, fillColor: "#0000ff" }),
      rigidBody: new BoxBody({ cx: 32 - i / 2, cy: 7 + i + .5, width: i, height: 1 }, { density: 1, elasticity: .3, friction: .4 }),
      role: new Obstacle()
    });
  }

  // Box in the middle
  new Actor({
    appearance: new FilledBox({ width: 6, height: 4, fillColor: "#0000ff" }),
    rigidBody: new BoxBody({ cx: 16, cy: 16, width: 6, height: 4 }, { density: 1, elasticity: .3, friction: .4 }),
    role: new Obstacle()
  });

  stage.world.setGravity(0, 10);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);

/**
* Create a RevoluteJoint to connect two bodies.  This helper makes Jockey
* construction a lot easier.
*
* @param bodyA    The first body
* @param anchorAX The X coordinate of the anchor for the first body
* @param anchorAY The Y coordinate of the anchor for the first body
* @param bodyB    The second body
* @param anchorBX The X coordinate of the anchor for the second body
* @param anchorBY The Y coordinate of the anchor for the second body
* @param lower    The lower joint angle in degrees
* @param upper    The upper joint angle in degrees
*
* @return The joint that was created
*/
function join(bodyA: Actor, anchorAX: number, anchorAY: number, bodyB: Actor, anchorBX: number, anchorBY: number, lower: number, upper: number) {
  let joint = new b2RevoluteJointDef();
  joint.bodyA = bodyA.rigidBody.body;
  joint.localAnchorA.Set(anchorAX, anchorAY);
  joint.bodyB = bodyB.rigidBody.body;
  joint.localAnchorB.Set(anchorBX, anchorBY);
  joint.collideConnected = false;
  joint.lowerAngle = lower * Math.PI / 180;
  joint.upperAngle = upper * Math.PI / 180;
  joint.enableLimit = true;
  return stage.world.physics.world.CreateJoint(joint);
}
