/*
  ____  _       _     _ ____            _       
 |  _ \(_) __ _(_) __| | __ )  ___   __| |_   _ 
 | |_) | |/ _` | |/ _` |  _ \ / _ \ / _` | | | |
 |  _ <| | (_| | | (_| | |_) | (_) | (_| | |_| |
 |_| \_\_|\__, |_|\__,_|____/ \___/ \__,_|\__, |
          |___/                           |___/ 

  A class to deal with easeljs object and box2d object
   RigidBody is basically a wrapper class that has Bitmap or something in easeljs and physics object in Box2dWeb
    Written by Jaewoong Hwang(http://jaewoong.info)
     April 2014
*/

(function(scope) {
    function RigidBody(skin, body, stage, b2d) {
        this.initialize(skin, body, b2d);
    }
    var p = RigidBody.prototype;


    /*  ╦┌┐┌┬┌┬┐┬┌─┐┬  ┬┌─┐┌─┐
        ║││││ │ │├─┤│  │┌─┘├┤ 
        ╩┘└┘┴ ┴ ┴┴ ┴┴─┘┴└─┘└─┘  */

    // Make a new RigidBody with given 4 parameters,
    // but I prefer to hand over only first 2 things,
    // and chain-call methods like: new RigidBody(skin, body).at(stage).in(box2d)
    p.initialize = function(skin, body, stage, b2d) {
        this.skin = skin;
        this.body = body;
        this.actor = body.GetUserData();
        this.stage = stage;
        this.b2d = b2d;

        // Aliases
        this.x = this.skin.x;
        this.y = this.skin.y;
        this.width = this.skin.image.width;
        this.height = this.skin.image.height;
        this.rotation = this.skin.rotation;
        this.angle = this.skin.rotation * Math.PI * 2 / 360;

        return this;
    };

    // Set a stage that the skin belongs to
    p.at = function(stage) {
        this.stage = stage;
        return this;
    };

    // Set a Box2d object that the body belongs to
    p.in = function(b2d) {
        this.b2d = b2d;
        return this;
    };


    /*  ╔═╗┬ ┬┬ ┬┌─┐┬┌─┐┌─┐  ┌┬┐┌─┐┌┬┐┬ ┬┌─┐┌┬┐┌─┐
        ╠═╝├─┤└┬┘└─┐││  └─┐  │││├┤  │ ├─┤│ │ ││└─┐
        ╩  ┴ ┴ ┴ └─┘┴└─┘└─┘  ┴ ┴└─┘ ┴ ┴ ┴└─┘─┴┘└─┘  */
    p.applyForce = function(force, point) {
        this.body.ApplyForce(force, point);
        return this;
    };

    // Apply force with angle and distance from the center of mass
    p.applyForce2 = function(angle, distance) {
        var point = this.body.GetWorldCenter();
        var theta = angle * Math.PI * 2 / 360;
        var dx = Math.cos(theta) * distance / this.b2d.SCALE;
        var dy = Math.sin(theta) * distance / this.b2d.SCALE;
        var force = new Box2D.Common.Math.b2Vec2(dx, dy);
        this.applyForce(force, point);
        return this;
    };

    p.applyImpulse = function(impulse, point) {
        this.body.ApplyImpulse(impulse, point);
        return this;
    };

    p.applyTorque = function(torque) {
        this.body.ApplyTorque(torque);
        return this;
    };


    /*  ╦╔═┬┬  ┬  
        ╠╩╗││  │  
        ╩ ╩┴┴─┘┴─┘  */
    p.kill = function() {
        this.b2d.removeActor(this.actor, this.stage);
    };

    scope.RigidBody = RigidBody;
}(window));