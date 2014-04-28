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
        this.timeBorn = Date.now();
        this.ticksBorn = game.ticks;
        this.id = Date.now().toString() + game.ticks.toString() + (game.tickObjCounter++).toString() + (parseInt(Math.random()*100)).toString();
        this.game = game;
        this.name = name;
        this.rigid = rigid;
        this.rigid['gameObject'] = this;
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

        // Common collision bahaviors
        this.addContactListener({
            BeginContact: function(rigidA, rigidB) {
                if(rigidA.gameObject && rigidB.gameObject) {
                    if(rigidA.gameObject.name == 'player') {
                        rigidA.gameObject.skin.addEventListener('animationend', function() {
                            this.gotoAndPlay('walk');
                            this.removeEventListener('animationend');
                        }.bind(rigidA.gameObject.skin));
                        rigidA.gameObject.skin.gotoAndPlay('hit');
                    } else if(rigidB.gameObject.name == 'player') {
                        rigidB.gameObject.skin.addEventListener('animationend', function() {
                            this.gotoAndPlay('walk');
                            this.removeEventListener('animationend');
                        }.bind(rigidB.gameObject.skin));
                        rigidB.gameObject.skin.gotoAndPlay('hit');
                    }
                }
            }.bind(this.game),
            EndContact: function(rigidA, rigidB) {
                delete this.testPlayer.dragger[rigidA.gameObject.id];
                delete this.testPlayer.dragger[rigidB.gameObject.id];
            }.bind(this.game),
            PostSolve: function(rigidA, rigidB) {
                if(rigidA.gameObject.name == 'player' || this.testPlayer.dragger[rigidA.gameObject.id]) {
                    this.testPlayer.dragger[rigidB.gameObject.id] = true;
                }
                if(rigidB.gameObject.name == 'player' || this.testPlayer.dragger[rigidB.gameObject.id]) {
                    this.testPlayer.dragger[rigidA.gameObject.id] = true;
                }
            }.bind(this.game)
        });

        // Specific behaviors according to its name
        switch(name) {
            case 'Mundane':
                this.point = 10;
                this.throwable = true;
                this.tappable = true;
                this.doYourJob = function(player) {
                    this.chase(player, {
                        uniformForce: { force: 10 * this.game.scale }
                    });
                };
                this.killEffect = 'Puff';
                break;
            case 'Folder':
                this.point = 20;
                this.skin.gotoAndPlay('burping');
                this.throwable = true;
                this.tappable = true;
                this.doYourJob = function(player) {
                    this.chase(player, {
                        uniformForce: { force: 20*this.game.FPScomp * this.game.scale }
                    });
                    if(!this['popped'] && this.game.ticks - this.ticksBorn > 200 && this.getY() > this.game.canvas.height*0.15) {
                        this.skin.addEventListener('animationend', function(evt) {
                            this.skin.gotoAndStop(3);
                        }.bind(this));
                        this.skin.gotoAndPlay('pop');
                        var skin, body, rigid;
                        for(var i = 0; i < 4; i++) {
                            this.game.stages.createEnemy('File', { x: this.getX(), y: this.getY()+10*this.game.scale });
                        }
                        this['popped'] = true;
                    }
                };
                this.killEffect = 'Puff';
                break;
            case 'File':
                this.point = 5;
                this.throwable = true;
                this.tappable = true;
                this.doYourJob = function(player) {
                    this.chase(player, {
                        uniformForce: { force: 5 * this.game.scale }
                    });
                };
                this.killEffect = 'Puff';
                break;
            case 'Inbox':
                this.point = 30;
                this.skin.gotoAndStop(7);
                this.tappable = function() {
                    this.skin.gotoAndStop(++this.skin.currentFrame);
                    if(this.skin.currentFrame == 0) {
                        this.game.gameScore += this.point;
                        this.kill();
                    }
                };
                this.doYourJob = function(player) {
                    this.chase(player, {
                        uniformForce: { force: 200 * this.game.scale }
                    });
                };
                this.killEffect = 'Puff';
                break;
            case 'Cloud':
                this.scrollSpeed = Math.random()*0.4 + 0.8;
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

    p.chase = function(target, option) {
        this.rigid.chase(target, option);
        return this;
    };

    p.addContactListener = function(callbacks) {
        this.rigid.addContactListener(callbacks);
    };


    /*  ╦╔═┬┬  ┬  
        ╠╩╗││  │  
        ╩ ╩┴┴─┘┴─┘  */
    p.kill = function() {
        for(var i = 0; i < this.game.allGameObjects.length; i++) {
            if(this.game.allGameObjects[i][this.id]) {
                delete this.game.allGameObjects[i][this.id];
                break;
            }
        }

        if(this['killEffect']) {
            var eff = this.game.imgEffect[this.killEffect].clone();
            eff.x = this.rigid.getX();
            eff.y = this.rigid.getY();
            eff.regX = eff.getBounds().width * 0.5;
            eff.regY = eff.getBounds().height * 0.5;
            eff.scaleX = eff.scaleY = this.rigid.skin.scaleX * (this.rigid.width > this.rigid.height ? this.rigid.width / eff.getBounds().width : this.rigid.height / eff.getBounds().height) * 2;
            eff.addEventListener('animationend', function() {
                this.game.testStage.removeChild(eff);
            });
            this.game.testStage.addChild(eff);
            eff.gotoAndPlay('eff');
        }
        this.rigid.kill();
    };

    scope.GameObject = GameObject;
}(window))