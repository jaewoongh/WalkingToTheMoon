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
            loop: function() {
                game.doYourJobEnemies();
                game.removeOffBoundaries(game.enemies);
                game.box2d.update();
                var interval = Math.random() * 0.4 + 0.2;
                if(createjs.Ticker.getTicks() % Math.round(createjs.Ticker.getFPS()*interval) == 0) {
                    var dice = Math.random();
                    if     (dice < 0.7) that.createEnemy('Mundane');
                    else if(dice < 0.9) that.createEnemy('Folder');
                    else if(dice < 1.0) that.createEnemy('Inbox');
                }
            },
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
                    x: option['x'] || Math.random()*game.canvas.width,
                    y: option['y'] || -game.canvas.height*0.1,
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