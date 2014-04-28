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
                game.doYourJobEnemies();
                game.removeOffBoundaries(game.enemies);
                game.box2d.update();
                var interval = Math.random() * 0.4 + 0.5;
                if(createjs.Ticker.getTicks() % Math.round(createjs.Ticker.getFPS()*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 0.7) that.createEnemy('Mundane');
                    else if(dice < 0.9) that.createEnemy('Folder');
                    else if(dice < 1.0) that.createEnemy('Inbox');
                }
            }
        };

        this['tutorial-1'] = {
            defaultDPS: 5,  // Distance per step
            defaultTPS: 20, // Tick per step
            stageLength: 30*5,

            testWelcomePhrase: 'Tap or swipe',

            loop: function() {
                game.doYourJobEnemies();
                game.removeOffBoundaries(game.enemies);
                game.box2d.update();
                var interval = Math.random() * 0.4 + 1;
                if(createjs.Ticker.getTicks() % Math.round(createjs.Ticker.getFPS()*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 1.0) that.createEnemy('Mundane');
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
                game.doYourJobEnemies();
                game.removeOffBoundaries(game.enemies);
                game.box2d.update();
                var interval = Math.random() * 0.4 + 1;
                if(createjs.Ticker.getTicks() % Math.round(createjs.Ticker.getFPS()*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 0.6) that.createEnemy('Mundane');
                    else if(dice < 1.0) that.createEnemy('Folder');
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
                game.doYourJobEnemies();
                game.removeOffBoundaries(game.enemies);
                game.box2d.update();
                var interval = Math.random() * 0.4 + 1;
                if(createjs.Ticker.getTicks() % Math.round(createjs.Ticker.getFPS()*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 0.3) that.createEnemy('Mundane');
                    else if(dice < 0.5) that.createEnemy('Folder');
                    else if(dice < 1.0) that.createEnemy('Inbox');
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
                var skin = game.imgEnemy['Mundane'][Math.floor(Math.random()*game.imgEnemy['Mundane'].length)].clone();
                var body = game.createCircleObject(skin, {
                    x: option['x'] || Math.random()*game.canvas.width,
                    y: option['y'] || -game.canvas.height*0.1,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(game.testStage).with(game.box2d);
                var gameobject = new GameObject(game, 'Mundane', rigid);
                game.enemies[gameobject.id] = gameobject;
                break;

            case 'Folder':
                var skin = game.imgEnemy['Folder'].clone();
                var body = game.createCircleObject(skin, {
                    x: option['x'] || Math.random()*game.canvas.width,
                    y: option['y'] || -game.canvas.height*0.1,
                    density: 8,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(game.testStage).with(game.box2d);
                var gameobject = new GameObject(game, 'Folder', rigid);
                game.enemies[gameobject.id] = gameobject;
                break;

            case 'File':
                var skin = game.imgEnemy['File'].clone();
                var body = game.createCircleObject(skin, {
                    x: option['x'] || Math.random()*game.canvas.width,
                    y: option['y'] || -game.canvas.height*0.1,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(game.testStage).with(game.box2d);
                var gameobject = new GameObject(game, 'File', rigid);
                game.enemies[gameobject.id] = gameobject;
                break;

            case 'Inbox':
                var skin = game.imgEnemy['Inbox'].clone();
                var body = game.createCircleObject(skin, {
                    x: option['x'] || (Math.random() < 0.5 ? game.canvas.width*1.1: -game.canvas.width*0.1),
                    y: option['y'] || Math.random()*game.canvas.height,
                    density: 120,
                    index: 0
                });
                var rigid = new RigidBody(skin, body).on(game.testStage).with(game.box2d);
                var gameobject = new GameObject(game, 'Inbox', rigid);
                game.enemies[gameobject.id] = gameobject;
                break;
        }
    };

    scope.GameStage = GameStage;
}(window));