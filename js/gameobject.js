/*
   ____                       ___  _     _           _   
  / ___| __ _ _ __ ___   ___ / _ \| |__ (_) ___  ___| |_ 
 | |  _ / _` | '_ ` _ \ / _ \ | | | '_ \| |/ _ \/ __| __|
 | |_| | (_| | | | | | |  __/ |_| | |_) | |  __/ (__| |_ 
  \____|\__,_|_| |_| |_|\___|\___/|_.__// |\___|\___|\__|
                                      |__/               
  A class that wraps basically RigidBody class as a GameObject
   GameObject object can have behaviors, like movement scenario and how it would be when tapped
    Written by Jaewoong Hwang(http://jaewoong.info)
     April 2014
*/

(function(scope) {
    function GameObject(game, name, rigid) {
        this.initialize(game, name, rigid);
    }
    var p = GameObject.prototype;


    /*  ╦┌┐┌┬┌┬┐┬┌─┐┬  ┬┌─┐┌─┐
        ║││││ │ │├─┤│  │┌─┘├┤ 
        ╩┘└┘┴ ┴ ┴┴ ┴┴─┘┴└─┘└─┘  */
    p.initialize = function(game, name, rigid) {
        this.game = game;
        this.name = name;
        this.rigid = rigid;
        rigid.enemy = this;

        // Aliases
        this.skin = rigid.skin;
        this.body = rigid.body;
        this.getX = function() { return this.rigid.getX(); };
        this.getY = function() { return this.rigid.getY(); };
        this.getRotation = function() { return this.rigid.getRotation(); };
        this.getAngle = function() { return this.rigid.getAngle(); };
        this.width = this.rigid.width;
        this.height = this.rigid.height;

        // Specific behaviors according to its name
        switch(name) {
            case 'Mundane':
                this.point = 10;
                this.throwable = true;
                this.tappable = true;
                this.chaseOption = {
                    uniformForce: { force: 10 * game.scale }
                };
                this.killEffect = 'Puff';
                break;
            case 'Folder':
                this.point = 20;
                this.skin.gotoAndPlay('burping');
                this.throwable = true;
                this.tappable = function() {
                    (function(folder) {
                        if(folder['popped']) {
                            folder.kill();
                        } else {
                            var x = folder.getX();
                            var y = folder.getY();
                            this.gameScore += folder.point;
                            folder.skin.addEventListener('animationend', function(evt) {
                                folder.skin.gotoAndStop(3);
                            });
                            folder.skin.gotoAndPlay('pop');
                            var skin, body, rigid;
                            for(var i = 0; i < 4; i++) {
                                this.stages.createEnemy('File', { x: x, y: y+10*this.scale });
                            }
                            folder['popped'] = true;
                        }
                    }).apply(this.game, [this]);
                };
                this.chaseOption = {
                    uniformForce: { force: 20 * game.scale }
                };
                this.killEffect = 'Puff';
                break;
            case 'File':
                this.point = 5;
                this.throwable = true;
                this.tappable = true;
                this.chaseOption = {
                    uniformForce: { force: 10 * game.scale }
                };
                this.killEffect = 'Puff';
                break;
            case 'Inbox':
                this.point = 30;
                this.skin.gotoAndStop(7);
                this.tappable = function() {
                    this.skin.gotoAndStop(++this.skin.currentFrame);
                    if(this.skin.currentFrame == 0) {
                        game.gameScore += this.point;
                        this.kill();
                    }
                };
                this.chaseOption = {
                    uniformForce: { force: 200 * game.scale }
                };
                this.killEffect = 'Puff';
                break;
        }
    };


    /*  ╔═╗┬ ┬┬ ┬┌─┐┬┌─┐┌─┐  ┌┬┐┌─┐┌┬┐┬ ┬┌─┐┌┬┐┌─┐
        ╠═╝├─┤└┬┘└─┐││  └─┐  │││├┤  │ ├─┤│ │ ││└─┐
        ╩  ┴ ┴ ┴ └─┘┴└─┘└─┘  ┴ ┴└─┘ ┴ ┴ ┴└─┘─┴┘└─┘  */
    p.applyForce = function(force, point) {
        this.rigid.applyForce(force, point);
        return this;
    };

    p.applyForce2 = function(angle, distance) {
        this.rigid.applyForce2(angle, distance);
        return this;
    };

    p.applyImpulse = function(impulse, point) {
        this.rigid.applyImpulse(impulse, point);
        return this;
    };

    p.applyImpulse2 = function(angle, distance) {
        this.rigid.applyImpulse2(angle, distance);
        return this;
    };

    p.chase = function(target) {
        this.rigid.chase(target, this.chaseOption);
        return this;
    };


    /*  ╦╔═┬┬  ┬  
        ╠╩╗││  │  
        ╩ ╩┴┴─┘┴─┘  */
    p.kill = function() {
        var eff = game.effects[this.killEffect].clone();
        eff.x = this.rigid.getX();
        eff.y = this.rigid.getY();
        eff.regX = eff.getBounds().width * 0.5;
        eff.regY = eff.getBounds().height * 0.5;
        eff.scaleX = eff.scaleY = this.rigid.skin.scaleX * (this.rigid.width > this.rigid.height ? this.rigid.width / eff.getBounds().width : this.rigid.height / eff.getBounds().height) * 2;
        eff.addEventListener('animationend', function() {
            game.testStage.removeChild(eff);
        });
        game.testStage.addChild(eff);
        eff.gotoAndPlay('eff');
        this.rigid.kill();
    };

    scope.GameObject = GameObject;
}(window))