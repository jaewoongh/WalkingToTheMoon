/*
   ____                      ____  _                   
  / ___| __ _ _ __ ___   ___/ ___|| |_ __ _  __ _  ___ 
 | |  _ / _` | '_ ` _ \ / _ \___ \| __/ _` |/ _` |/ _ \
 | |_| | (_| | | | | | |  __/___) | || (_| | (_| |  __/
  \____|\__,_|_| |_| |_|\___|____/ \__\__,_|\__, |\___|
                                            |___/      
  A class that has information about stages and creation method of enemies
   Written by Jaewoong Hwang(http://jaewoong.info)
    April 2014
*/

(function(scope) {
    function GameStage(game) {
        this.initialize(game);
    }
    var p = GameStage.prototype;


    /*  ╦┌┐┌┬┌┬┐┬┌─┐┬  ┬┌─┐┌─┐
        ║││││ │ │├─┤│  │┌─┘├┤ 
        ╩┘└┘┴ ┴ ┴┴ ┴┴─┘┴└─┘└─┘  */
    p.initialize = function(game) {
        this.game = game;
        this.setStages();
    };


/*  ╔═╗┌┬┐┌─┐┌─┐┌─┐  ╔╦╗┌─┐┌┬┐┌─┐
    ╚═╗ │ ├─┤│ ┬├┤    ║║├─┤ │ ├─┤
    ╚═╝ ┴ ┴ ┴└─┘└─┘  ═╩╝┴ ┴ ┴ ┴ ┴   */
    p.setStages = function() {
        var that = this;
        this['test'] = {
            defaultDPS: 7,  // Distance per step
            defaultTPS: 20, // Tick per step
            stageLength: 500*7,

            testWelcomePhrase: 'Enjoy :^)',

            loop: function() {
                that.game.doYourJobEnemies();
                that.game.removeOffBoundaries(that.game.enemies);
                that.game.scrollProps();
                that.game.removeOffBoundaries(that.game.props);
                that.game.box2d.update();
                var interval = Math.random() * 0.4 + 0.5;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 0.7) that.createEnemy('Mundane');
                    else if(dice < 0.9) that.createEnemy('Folder');
                    else if(dice < 1.0) that.createEnemy('Inbox');
                }
                interval = Math.random() * 0.2 + 0.2;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    that.createProp('Cloud', {spriteNumber: parseInt(Math.random() * 5)});
                }
            }
        };

        this['tutorial-1'] = {
            defaultDPS: 5,  // Distance per step
            defaultTPS: 20, // Tick per step
            stageLength: 30*5,

            testWelcomePhrase: 'Tap or swipe',

            loop: function() {
                that.game.doYourJobEnemies();
                that.game.removeOffBoundaries(that.game.enemies);
                that.game.scrollProps();
                that.game.removeOffBoundaries(that.game.props);
                that.game.box2d.update();
                var interval = Math.random() * 0.4 + 1;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 1.0) that.createEnemy('Mundane');
                }
                interval = Math.random() * 0.2 + 0.2;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    that.createProp('Cloud', {spriteNumber: parseInt(Math.random() * 5)});
                }
            },

            nextStage: 'tutorial-2'
        };

        this['tutorial-2'] = {
            defaultDPS: 5,  // Distance per step
            defaultTPS: 20, // Tick per step
            stageLength: 40*5,

            testWelcomePhrase: 'Tap ASAP',

            loop: function() {
                that.game.doYourJobEnemies();
                that.game.removeOffBoundaries(that.game.enemies);
                that.game.scrollProps();
                that.game.removeOffBoundaries(that.game.props);
                that.game.box2d.update();
                var interval = Math.random() * 0.4 + 1;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 0.6) that.createEnemy('Mundane');
                    else if(dice < 1.0) that.createEnemy('Folder');
                }
                interval = Math.random() * 0.2 + 0.2;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    that.createProp('Cloud', {spriteNumber: parseInt(Math.random() * 5)});
                }
            },

            nextStage: 'tutorial-3'
        };

        this['tutorial-3'] = {
            defaultDPS: 5,  // Distance per step
            defaultTPS: 20, // Tick per step
            stageLength: 50*5,

            testWelcomePhrase: 'Tap tap tap',

            loop: function() {
                that.game.doYourJobEnemies();
                that.game.removeOffBoundaries(that.game.enemies);
                that.game.scrollProps();
                that.game.removeOffBoundaries(that.game.props);
                that.game.box2d.update();
                var interval = Math.random() * 0.4 + 1;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 0.3) that.createEnemy('Mundane');
                    else if(dice < 0.5) that.createEnemy('Folder');
                    else if(dice < 1.0) that.createEnemy('Inbox');
                }
                interval = Math.random() * 0.2 + 0.2;
                if(that.game.ticks % Math.round(that.game.fps*interval) == 0) {
                    that.createProp('Cloud', {spriteNumber: parseInt(Math.random() * 5)});
                }
            },

            nextStage: 'test'
        };
    };


/*  ╔═╗┌┐┌┌─┐┌┬┐┬ ┬  ╔═╗┬─┐┌─┐┌─┐┌┬┐┌─┐┬┌─┐┌┐┌
    ║╣ │││├┤ │││└┬┘  ║  ├┬┘├┤ ├─┤ │ ├┤ ││ ││││
    ╚═╝┘└┘└─┘┴ ┴ ┴   ╚═╝┴└─└─┘┴ ┴ ┴ └─┘┴└─┘┘└┘  */
    p.createEnemy = function(enemy, option) {
        option = option || {};
        switch(enemy) {
            case 'Mundane':
                var skin = game.imgEnemy['Mundane'][Math.floor(Math.random()*this.game.imgEnemy['Mundane'].length)].clone();
                var body = game.createCircleObject(skin, {
                    x: option['x'] || Math.random()*this.game.canvas.width,
                    y: option['y'] || -this.game.canvas.height*0.1,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(this.game.testStage).with(this.game.box2d);
                var gameobject = new GameObject(this.game, 'Mundane', rigid);
                this.game.enemies[gameobject.id] = gameobject;
                break;

            case 'Folder':
                var skin = this.game.imgEnemy['Folder'].clone();
                var body = this.game.createCircleObject(skin, {
                    x: option['x'] || Math.random()*this.game.canvas.width,
                    y: option['y'] || -this.game.canvas.height*0.1,
                    density: 8,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(this.game.testStage).with(this.game.box2d);
                var gameobject = new GameObject(this.game, 'Folder', rigid);
                this.game.enemies[gameobject.id] = gameobject;
                break;

            case 'File':
                var skin = this.game.imgEnemy['File'].clone();
                var body = this.game.createCircleObject(skin, {
                    x: option['x'] || Math.random()*this.game.canvas.width,
                    y: option['y'] || -this.game.canvas.height*0.1,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(this.game.testStage).with(this.game.box2d);
                var gameobject = new GameObject(this.game, 'File', rigid);
                this.game.enemies[gameobject.id] = gameobject;
                break;

            case 'Inbox':
                var skin = this.game.imgEnemy['Inbox'].clone();
                var body = this.game.createCircleObject(skin, {
                    x: option['x'] || (Math.random() < 0.5 ? this.game.canvas.width*1.1: -this.game.canvas.width*0.1),
                    y: option['y'] || Math.random()*this.game.canvas.height,
                    density: 120,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(this.game.testStage).with(this.game.box2d);
                var gameobject = new GameObject(this.game, 'Inbox', rigid);
                this.game.enemies[gameobject.id] = gameobject;
                break;
        }
    };


/*  ╔═╗┬─┐┌─┐┌─┐  ╔═╗┬─┐┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
    ╠═╝├┬┘│ │├─┘  ║  ├┬┘├┤ ├─┤ │ ││ ││││
    ╩  ┴└─└─┘┴    ╚═╝┴└─└─┘┴ ┴ ┴ ┴└─┘┘└┘    */    
    p.createProp = function(name, option) {
        var prop = this.game.imgProp[name].clone();
        prop.x = option['x'] || Math.random() * this.game.canvas.width;
        prop.y = option['y'] || -this.game.canvas.height*0.2;
        if(prop instanceof createjs.Sprite) {
            prop.regX = prop.getTransformedBounds.width*0.5;
            prop.regY = prop.getTransformedBounds.height*0.5;
        } else if(prop instanceof createjs.Bitmap) {
            prop.regX = prop.image.width*0.5;
            prop.regY = prop.image.height*0.5;
        }
        prop.scaleX = prop.scaleY = this.game.scale;
        if(option['spriteNumber']) prop.gotoAndStop(option['spriteNumber']);
        this.game.testStage.addChildAt(prop, 0);
        this.game.props.push(new GameObject(this.game, 'Cloud', new RigidBody(prop, {}).on(this.game.testStage)));
    };

    scope.GameStage = GameStage;
}(window));