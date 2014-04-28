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
    // and chain-call methods like: new RigidBody(skin, body).on(stage).with(box2d)
    p.initialize = function(skin, body, stage, b2d) {
        this.skin = skin;
        this.body = body;
        this.body.RigidBody = this;
        try {
            this.actor = body.GetUserData();
        } catch(err) {
            this.actor = {};
        }
        this.stage = stage;
        this.b2d = b2d;

        // Aliases
        this.getX = function() { return this.skin.x; };
        this.getY = function() { return this.skin.y; };
        this.getRotation = function() { return this.skin.rotation; };
        this.getAngle = function() { return this.getRotation() * Math.PI * 2 / 360; };
        if(this.skin instanceof createjs.Bitmap) {
            this.width = this.skin.image.width;
            this.height = this.skin.image.height;
        } else if(this.skin instanceof createjs.Sprite) {
            this.width = this.skin.spriteSheet.getFrameBounds(0).width * 0.5;
            this.height = this.skin.spriteSheet.getFrameBounds(0).height * 0.5;
        }

        return this;
    };

    // Set a stage that the skin belongs to
    p.on = function(stage) {
        this.stage = stage;
        return this;
    };

    // Set a Box2d object that the body belongs to
    p.with = function(b2d) {
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
        this.applyImpulse(force, point);
        return this;
    };

    p.applyImpulse = function(impulse, point) {
        this.body.ApplyImpulse(impulse, point);
        return this;
    };

    // Apply impulse with angle and distance from the center of mass
    p.applyImpulse2 = function(angle, distance) {
        var point = this.body.GetWorldCenter();
        var theta = angle * Math.PI * 2 / 360;
        var dx = Math.cos(theta) * distance / this.b2d.SCALE;
        var dy = Math.sin(theta) * distance / this.b2d.SCALE;
        var impulse = new Box2D.Common.Math.b2Vec2(dx, dy);
        this.applyImpulse(impulse, point);
        return this;
    };

    p.applyTorque = function(torque) {
        this.body.ApplyTorque(torque);
        return this;
    };

    p.chase = function(target, option) {
        var dest = target.body.GetWorldCenter().Copy();
        var start = this.body.GetWorldCenter();
        dest.Subtract(start);
        if(option['uniformForce']) {
            dest.Normalize();
            dest.Multiply(option.uniformForce['force']);
            this.applyForce(dest, this.body.GetWorldCenter());
        } else if(option['ease']) {
            var force = Math.map2(Math.pow(dest.Length(), option.ease['power']),
                Math.pow(option.ease['distMax'], option.ease['power']), Math.pow(option.ease['distMin'], option.ease['power']),
                Math.pow(option.ease['forceMin'], option.ease['power']), Math.pow(option.ease['forceMax'], option.ease['power']));
            force = Math.pow(force, 1/option.ease['power']);
            dest.Normalize();
            dest.Multiply(force);
            this.applyForce(dest, this.body.GetWorldCenter());
        }
        return this;
    };


    /*  ╦╔═┬┬  ┬  
        ╠╩╗││  │  
        ╩ ╩┴┴─┘┴─┘  */
    p.kill = function() {
        this.stage.removeChild(this.skin);
        if(this['b2d']) this.b2d.kill(this);
    };

    scope.RigidBody = RigidBody;
}(window));