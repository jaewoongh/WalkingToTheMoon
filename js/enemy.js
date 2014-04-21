/*
  _____                            
 | ____|_ __   ___ _ __ ___  _   _ 
 |  _| | '_ \ / _ \ '_ ` _ \| | | |
 | |___| | | |  __/ | | | | | |_| |
 |_____|_| |_|\___|_| |_| |_|\__, |
                             |___/ 
  A class that wraps RigidBody class as a enemy
   Enemy class has some built-in behaviors set by its name
    Written by Jaewoong Hwang(http://jaewoong.info)
     April 2014
*/

(function(scope) {
    function Enemy(game, name, rigid) {
        this.initialize(game, name, rigid);
    }
    var p = Enemy.prototype;


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
                this.throwable = true;
                this.tappable = true;
                this.chaseOption = {
                    uniformForce: { force: 10 * game.scale }
                };
                break;
            case 'Folder':
                this.throwable = true;
                this.tappable = function() {
                    (function(folder) {
                        var x = folder.getX();
                        var y = folder.getY();
                        folder.kill();
                        var skin, body, rigid;
                        for(var i = 0; i < 4; i++) {
                            skin = this.imgEnemyFile.clone();
                            body = this.createCircleObject(skin, { x: x, y: y, index: 0 });
                            rigid = new RigidBody(skin, body).on(this.testStage).with(this.box2d);
                            this.testEnemies.push(new Enemy(this, 'File', rigid));
                        }
                    }).apply(this.game, [this]);
                };
                this.chaseOption = {
                    uniformForce: { force: 20 * game.scale }
                };
                break;
            case 'File':
                this.throwable = true;
                this.tappable = true;
                this.chaseOption = {
                    uniformForce: { force: 10 * game.scale }
                };
                break;
            case 'Inbox':
                this.skin.gotoAndStop(7);
                this.tappable = function() {
                    this.skin.gotoAndStop(++this.skin.currentFrame);
                    if(this.skin.currentFrame == 0) {
                        this.kill();
                    }
                };
                this.chaseOption = {
                    uniformForce: { force: 90 * game.scale }
                };
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
        this.rigid.kill();
    };

    scope.Enemy = Enemy;
}(window))