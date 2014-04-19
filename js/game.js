/*
 __        __    _ _    _               _          _   _            __  __                   
 \ \      / /_ _| | | _(_)_ __   __ _  | |_ ___   | |_| |__   ___  |  \/  | ___   ___  _ __  
  \ \ /\ / / _` | | |/ / | '_ \ / _` | | __/ _ \  | __| '_ \ / _ \ | |\/| |/ _ \ / _ \| '_ \ 
   \ V  V / (_| | |   <| | | | | (_| | | || (_) | | |_| | | |  __/ | |  | | (_) | (_) | | | |
    \_/\_/ \__,_|_|_|\_\_|_| |_|\__, |  \__\___/   \__|_| |_|\___| |_|  |_|\___/ \___/|_| |_|
                                |___/                                                        
                             ╔═╗  ╔═╗╔═╗╔╦╗╔═╗  ╔═╗╔═╗╦═╗╔╦╗     
                        ───  ╠═╣  ║ ╦╠═╣║║║║╣   ╠═╝╠═╣╠╦╝ ║   ───
                             ╩ ╩  ╚═╝╩ ╩╩ ╩╚═╝  ╩  ╩ ╩╩╚═ ╩      

  A game part(prototype) of the project Walking to the Moon.
   Written by Jaewoong Hwang(http://jaewoong.info)
    April 2014
*/


var game;

(function(scope) {
    function Game() {
        this.initialize();
    }
    var p = Game.prototype;
    var debug = true;
    var debugBox2d = false;

    var targetWidth = 1080;
    var targetHeight = 1920;


    /*  ╔═╗┌─┐┌─┐┌─┐┌┬┐┌─┐
        ╠═╣└─┐└─┐├┤  │ └─┐
        ╩ ╩└─┘└─┘└─┘ ┴ └─┘  */

    // Images for emenies
    var IMG_ENEMIES = [
        './assets/images/enemies/e0.png',
        './assets/images/enemies/e1.png',
        './assets/images/enemies/e2.png',
        './assets/images/enemies/e3.png',
        './assets/images/enemies/e4.png',
        './assets/images/enemies/e5.png'
    ];

    // Sprite sheet for test player
    var ANI_PLAYER = [
        './assets/images/players/redboots.png'
    ];

    // Combine all the assets
    var ASSETS = [].concat(IMG_ENEMIES, ANI_PLAYER);


    /*  ╦┌┐┌┬┌┬┐┬┌─┐┬  ┬┌─┐┌─┐
        ║││││ │ │├─┤│  │┌─┘├┤ 
        ╩┘└┘┴ ┴ ┴┴ ┴┴─┘┴└─┘└─┘  */
    p.initialize = function() {
        if(debug) console.log('Initializing Game..');

        // Set up a canvas
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('style', 'position:absolute; z-index:1;');
        this.canvas.id = 'gameCanvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext('2d');
        this.context['imageSmoothingEnabled'] = false;
        this.context['mozImageSmoothingEnabled'] = false;
        this.context['oImageSmoothingEnabled'] = false;
        this.context['webkitImageSmoothingEnabled'] = false;
        this.context['msImageSmoothingEnabled'] = false;
        document.body.appendChild(this.canvas);
        this.scale = this.canvas.height / targetHeight;

        // Set up a debug canvas
        this.debugCanvas = document.createElement('canvas');
        this.debugCanvas.setAttribute('style', 'position:absolute; z-index:0;');
        this.debugCanvas.id = 'debugCanvas';
        this.debugCanvas.width = window.innerWidth;
        this.debugCanvas.height = window.innerHeight;
        this.debugContext = this.canvas.getContext('2d');
        document.body.appendChild(this.debugCanvas);

        // Create stage and enable touch and gesture
        this.testStage = new createjs.Stage(this.canvas);
        this.testStage.snapPixelEnabled = true;
        createjs.Touch.enable(this.testStage);
        this.basicGesture = new BasicGesture(this.testStage);
        this.testStage.addEventListener('gesturestart', this.handleGesture.bind(this));
        this.testStage.addEventListener('gesturetap', this.handleGesture.bind(this));
        this.testStage.addEventListener('gestureswipe', this.handleGesture.bind(this));
        this.testStage.addEventListener('gesturehold', this.handleGesture.bind(this));
        this.testStage.addEventListener('gestureholdend', this.handleGesture.bind(this));

        // Load assets
        this.assets = new AssetFactory();
        this.assets.onComplete = this.assetsLoaded.bind(this);
        this.assets.loadAssets(ASSETS);

        // Initialize Box2D
        this.box2d = new Box2d4Easeljs(this, {
            SCALE: 30,
            STEP: 20
        });

        // Game variables
        this.testEnemies = [];
    };


    /*  ╔═╗┬  ┬┌─┐┬─┐┬ ┬┌┬┐┬ ┬┬┌┐┌┌─┐  ┬┌─┐  ┬─┐┌─┐┌─┐┌┬┐┬ ┬┬
        ║╣ └┐┌┘├┤ ├┬┘└┬┘ │ ├─┤│││││ ┬  │└─┐  ├┬┘├┤ ├─┤ ││└┬┘│
        ╚═╝ └┘ └─┘┴└─ ┴  ┴ ┴ ┴┴┘└┘└─┘  ┴└─┘  ┴└─└─┘┴ ┴─┴┘ ┴ o   */
    p.assetsLoaded = function() {
        if(debug) console.log('.. assets are loaded');

        // Assign images for enemies
        this.imgEnemy = [];
        for(var i = 0; i < IMG_ENEMIES.length; i++) {
            this.imgEnemy.push(new createjs.Bitmap(this.assets[IMG_ENEMIES[i]]));
        }

        // Assign sprite for a player
        var SPR_PLAYER = new createjs.SpriteSheet({
            images: [this.assets[ANI_PLAYER]],
            frames: {
                height: 350,
                width: 470,
                count: 4
            },
            animations: {
                walk: {
                    frames: [0, 1, 2, 3],
                    speed: 0.3
                },
                hit: {
                    frames: [2],
                }
            }
        });
        this.aniPlayer = new createjs.Sprite(SPR_PLAYER);

        // Create test player
        this.aniPlayer.x = this.canvas.width * 0.5;
        this.aniPlayer.y = this.canvas.height * 0.8;
        this.aniPlayer.regX = this.aniPlayer.spriteSheet.getFrameBounds(0).width * 0.5;
        this.aniPlayer.regY = this.aniPlayer.spriteSheet.getFrameBounds(0).height * 0.5;
        this.aniPlayer.scaleX = this.scale;
        this.aniPlayer.scaleY = this.scale;
        this.aniPlayer.gotoAndPlay('walk');
        this.testStage.addChild(this.aniPlayer);

        // Set Ticker
        createjs.Ticker.setFPS(30);
        createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
    };


    /*  ╦  ┌─┐┌─┐┌─┐
        ║  │ ││ │├─┘
        ╩═╝└─┘└─┘┴      */
    p.onTick = function() {
        this.removeOffBoundaries(this.testEnemies);
        this.box2d.update();
        this.testStage.update();
        this.basicGesture.run();

        if(createjs.Ticker.getTicks() % Math.round(createjs.Ticker.getFPS()*(Math.random()*0.4+0.2)) == 0) {
            this.createTestEnemy2();
        }
    };

    p.removeOffBoundaries = function(array) {
        for(var i = array.length-1; i >= 0; i--) {
            var one = array[i];
            if (one.skin.x + one.skin.image.width*0.5 < 0 ||
                one.skin.x - one.skin.image.width*0.5 >= this.canvas.width ||
                one.skin.y + one.skin.image.height*0.5 < -this.canvas.height*0.2 ||
                one.skin.y - one.skin.image.height*0.5 >= this.canvas.width) {
                one.kill();
                array.splice(i, 1);
            }
        }
    };


    /*  ╦ ╦┌─┐┌┐┌┌┬┐┬  ┌─┐  ┌┬┐┌─┐┬ ┬┌─┐┬ ┬┌─┐┌─┐
        ╠═╣├─┤│││ │││  ├┤    │ │ ││ ││  ├─┤├┤ └─┐
        ╩ ╩┴ ┴┘└┘─┴┘┴─┘└─┘   ┴ └─┘└─┘└─┘┴ ┴└─┘└─┘   */
    p.handleGesture = function(evt) {
        switch(evt.type) {
            case 'gesturestart':
                break;
            case 'gesturetap':
                break;
            case 'gestureswipe':
                // // Test#1: Swipe generates enemy
                // this.createTestEnemy(evt.detail);

                // // Test#2: Swipe picks an enemy and throw it
                // var rigid = this.box2d.pickRigidBody(evt.detail.sx, evt.detail.sy, this.canvas.height * 0.1);
                // if(rigid) rigid.applyForce2(evt.detail.swipeAngle, Math.max(Math.pow(evt.detail.swipeDistance, 2), this.canvas.height*0.2));

                // Test#3: Swipe picks enemies on its trail and throw them
                var rigid, targetX, targetY;
                for(var i = -0.2, j = -0.2; i < 1; i += 0.1, j += 0.1) {
                    targetX = evt.detail.sx + (evt.detail.x - evt.detail.sx) * i;
                    targetY = evt.detail.sy + (evt.detail.y - evt.detail.sy) * i;
                    regid = null;
                    rigid = this.box2d.pickRigidBody(targetX, targetY, this.canvas.height * 0.05);
                    if(rigid) rigid.applyImpulse2(evt.detail.swipeAngle, Math.max(evt.detail.swipeDistance*Math.pow(1-i, 2)*0.1, this.canvas.height*0.01));
                }
                break;
            case 'gesturehold':
                break;
            case 'gestureholdend':
                break;
        }
    };


    /*  ╔═╗┬─┐┌─┐┌─┐┌┬┐┌─┐  ┌┬┐┌─┐┌┬┐┬ ┬┌─┐┌┬┐┌─┐
        ║  ├┬┘├┤ ├─┤ │ ├┤   │││├┤  │ ├─┤│ │ ││└─┐
        ╚═╝┴└─└─┘┴ ┴ ┴ └─┘  ┴ ┴└─┘ ┴ ┴ ┴└─┘─┴┘└─┘   */
    p.createTestEnemy = function(evt) {
        var skin = this.imgEnemy[Math.floor(Math.random()*this.imgEnemy.length)].clone();
        var body = this.createCircleObject(skin, { x: evt.sx, y: evt.sy });
        var rigid = new RigidBody(skin, body).on(this.testStage).with(this.box2d);
        rigid.applyForce2(evt.swipeAngle, evt.swipeDistance);
        this.testEnemies.push(rigid);
    };

    p.createTestEnemy2 = function() {
        var skin = this.imgEnemy[Math.floor(Math.random()*this.imgEnemy.length)].clone();
        var body = this.createCircleObject(skin, { x: Math.random()*this.canvas.width, y: -this.canvas.height*0.1 });
        var rigid = new RigidBody(skin, body).on(this.testStage).with(this.box2d);
        this.testEnemies.push(rigid);
    };


    /*  ╔═╗┬─┐┌─┐┌─┐┌┬┐┌─┐  ┌┬┐┌─┐┌┬┐┬ ┬┌─┐┌┬┐┌─┐       ┌┐ ┌─┐─┐ ┬╔═╗┌┬┐
        ║  ├┬┘├┤ ├─┤ │ ├┤   │││├┤  │ ├─┤│ │ ││└─┐  ───  ├┴┐│ │┌┴┬┘╔═╝ ││
        ╚═╝┴└─└─┘┴ ┴ ┴ └─┘  ┴ ┴└─┘ ┴ ┴ ┴└─┘─┴┘└─┘       └─┘└─┘┴ └─╚═╝─┴┘    */

    // Create circle object with image and options(necessary)
    // Options: x, y, diameter, density, friction, restitution
    p.createCircleObject = function(thing, option) {
        thing.x = option['x'];
        thing.y = option['y'];
        if(thing instanceof createjs.Bitmap) {
            thing.regX = thing.image.width * 0.5;
            thing.regY = thing.image.height * 0.5;
        } else if(thing instanceof createjs.Sprite) {
            thing.regX = thing.spriteSheet.getFrame(0).rect.width * 0.5;
            thing.regY = thing.spriteSheet.getFrame(0).rect.height * 0.5;
        }
        thing.scaleX = this.scale;
        thing.scaleY = this.scale;
        thing.snapToPixel = true;
        // this.testStage.addChild(thing);
        this.testStage.addChildAt(thing, 0);
        return this.box2d.createCircle(thing, option);
    };


    // /*  ╦═╗┌─┐┌─┐┬┌─┐┌─┐  ┌─┐┌─┐┌┐┌┬  ┬┌─┐┌─┐
    //     ╠╦╝├┤ └─┐│┌─┘├┤   │  ├─┤│││└┐┌┘├─┤└─┐
    //     ╩╚═└─┘└─┘┴└─┘└─┘  └─┘┴ ┴┘└┘ └┘ ┴ ┴└─┘   */
    // p.resizeCanvas = function(evt) {
    //     this.canvas.width = window.innerWidth;
    //     this.canvas.height = window.innerHeight;
    //     this.debugCanvas.width = window.innerWidth;
    //     this.debugCanvas.height = window.innerHeight;
    // };

    scope.Game = Game;
}(window));

window.onload = function() {
    setTimeout(function() { game = new Game(); }, 200);
};

// window.onresize = function() {
//     game.resizeCanvas();
// }