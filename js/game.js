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

    // Title image
    var BG_TITLE = ['./assets/images/backgrounds/title.png'];

    // Images for emenies
    var IMG_ENEMY_MUNDANE = [
        './assets/images/enemies/mundane0.png',
        './assets/images/enemies/mundane1.png',
        './assets/images/enemies/mundane2.png',
        './assets/images/enemies/mundane3.png'
    ];
    var IMG_ENEMY_FILE = ['./assets/images/enemies/file.png'];
    var ANI_ENEMY_FOLDER = ['./assets/images/enemies/folder.png'];
    var ANI_ENEMY_INBOX = ['./assets/images/enemies/inbox.png'];

    // Puff effect for dying enemies
    var ANI_EFFECT_PUFF = ['./assets/images/enemies/puff.png'];

    // Props
    var ANI_PROP_CLOUD = ['./assets/images/backgrounds/cloud.png'];

    // Sprite sheet for test player
    var ANI_PLAYER = ['./assets/images/players/charles.png'];

    // Combine all the assets
    var ASSETS = [].concat(
        BG_TITLE,
        IMG_ENEMY_MUNDANE,
        IMG_ENEMY_FILE,
        ANI_ENEMY_FOLDER,
        ANI_ENEMY_INBOX,
        ANI_EFFECT_PUFF,
        ANI_PROP_CLOUD,
        ANI_PLAYER);


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

        // Initialize Stage data
        this.stages = new GameStage(this);

        // Test data
        this.globalSteps = 1000;
        this.gameScore = 0;

        // Game variables
        this.enemies = [];
        this.allGameObjects = [
            this.enemies
        ];
        this.props = [];
    };


    /*  ╔═╗┬  ┬┌─┐┬─┐┬ ┬┌┬┐┬ ┬┬┌┐┌┌─┐  ┬┌─┐  ┬─┐┌─┐┌─┐┌┬┐┬ ┬┬
        ║╣ └┐┌┘├┤ ├┬┘└┬┘ │ ├─┤│││││ ┬  │└─┐  ├┬┘├┤ ├─┤ ││└┬┘│
        ╚═╝ └┘ └─┘┴└─ ┴  ┴ ┴ ┴┴┘└┘└─┘  ┴└─┘  ┴└─└─┘┴ ┴─┴┘ ┴ o   */
    p.assetsLoaded = function() {
        if(debug) console.log('.. assets are loaded');

        // Title screen & ui
        this.bgTitle = new createjs.Bitmap(this.assets[BG_TITLE]);
        this.bgTitle.x = this.canvas.width * 0.5;
        this.bgTitle.y = this.canvas.height * 0.5;
        this.bgTitle.regX = this.bgTitle.image.width * 0.5;
        this.bgTitle.regY = this.bgTitle.image.height * 0.5;
        this.bgTitle.scaleX = this.bgTitle.scaleY = this.scale;

        // Mundane enemies
        this.imgEnemy = [];
        this.imgEnemy['Mundane'] = [];
        for(var i = 0; i < IMG_ENEMY_MUNDANE.length; i++) {
            var imgEnemyMundane = new createjs.Bitmap(this.assets[IMG_ENEMY_MUNDANE[i]]);
            this.imgEnemy['Mundane'].push(imgEnemyMundane);
        }

        // File enemy
        this.imgEnemy['File'] = new createjs.Bitmap(this.assets[IMG_ENEMY_FILE]);

        // Folder enemy
        var SPR_ENEMY_FOLDER = new createjs.SpriteSheet({
            images: [this.assets[ANI_ENEMY_FOLDER]],
            frames: {
                height: 176,
                width: 200,
                count: 4
            },
            animations: {
                burping: {
                    frames: [0, 1],
                    speed: 0.3
                },
                pop: {
                    frames: [2, 3],
                    speed: 0.4
                }
            }

        });
        this.imgEnemy['Folder'] = new createjs.Sprite(SPR_ENEMY_FOLDER);

        // Inbox enemy
        var SPR_ENEMY_INBOX = new createjs.SpriteSheet({
            images: [this.assets[ANI_ENEMY_INBOX]],
            frames: {
                height: 180,
                width: 220,
                count: 10
            },
            animations: {
                counter: { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
            }
        });
        this.imgEnemy['Inbox'] = new createjs.Sprite(SPR_ENEMY_INBOX);

        // Puff effect
        var SPR_EFFECT_PUFF = new createjs.SpriteSheet({
            images: [this.assets[ANI_EFFECT_PUFF]],
            frames: {
                height: 170,
                width: 150,
                count: 5
            },
            animations: {
                eff: { frames: [0, 1, 2, 3, 4], speed: 0.5 }
            }
        });
        this.imgEffect = [];
        this.imgEffect['Puff'] = new createjs.Sprite(SPR_EFFECT_PUFF);

        // Cloud prop
        var SPR_PROP_CLOUD = new createjs.SpriteSheet({
            images: [this.assets[ANI_PROP_CLOUD]],
            frames: {
                height: 134,
                width: 258,
                count: 5
            },
            animations: {
                kind: { frames: [0, 1, 2, 3, 4] }
            }
        });
        this.imgProp = [];
        this.imgProp['Cloud'] = new createjs.Sprite(SPR_PROP_CLOUD);

        // Assign sprite for a player
        var SPR_PLAYER = new createjs.SpriteSheet({
            images: [this.assets[ANI_PLAYER]],
            frames: {
                height: 239,
                width: 300,
                count: 5
            },
            animations: {
                walk: {
                    frames: [0, 1, 2, 3],
                    speed: 0.1
                },
                hit: {
                    frames: [4],
                }
            }
        });
        this.aniPlayer = new createjs.Sprite(SPR_PLAYER);

        // Set game phase
        this.gamePhase = {};
        this.gamePhase['phase'] = 'INIT';

        // Set Ticker
        this.targetFPS = 30;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.setFPS(this.targetFPS);
        this.paused = false;
        createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
    };


    /*  ╦  ┌─┐┌─┐┌─┐
        ║  │ ││ │├─┘
        ╩═╝└─┘└─┘┴      */
    p.onTick = function() {
        this.ticks = createjs.Ticker.getTicks();
        this.tickObjCounter = 0;
        this.fps = createjs.Ticker.getMeasuredFPS();
        this.FPScomp = this.targetFPS / this.fps;
        if(this.paused === false) {
            switch(this.gamePhase['phase']) {
                case 'INIT':
                    this.testStage.addChild(this.bgTitle);
                    this.gamePhase['phase'] = 'TITLE';
                    break;
                case 'TITLE':
                    break;
                case 'IN-STAGE':
                    // Run stage
                    var currentStage = this.stages[this.gamePhase['stage']];
                    currentStage.loop();

                    // Update numbers
                    if(this.ticks % currentStage['defaultTPS'] == currentStage['defaultTPS'] -1) {
                        this.testPlayer['distanceWalked'] += this.testPlayer['dps'];
                        this.testPlayer['stepsWalked']++;
                        this.globalSteps--;

                        if(this.testPlayer['distanceWalked'] >= currentStage.stageLength) {
                            // Stage clear
                            this.testPlayer['distanceWalked'] = currentStage.stageLength;
                            var font = 'bold ' + 96 * this.scale + 'px Helvetica';
                            this.textGameover = new createjs.Text('STAGE CLEAR', font, '#000000');
                            this.textGameover.textAlign = 'center';
                            this.textGameover.x = this.canvas.width*0.5;
                            this.textGameover.y = this.canvas.height*0.5;
                            this.testStage.addChild(this.textGameover);

                            for(var key in this.enemies) {
                                this.enemies[key].kill();
                            }
                            this.pause();
                            if(currentStage['nextStage']) {
                                setTimeout(function() {
                                    this.testPlayer.init(this.stages[currentStage.nextStage]);
                                    this.gamePhase['stage'] = currentStage.nextStage;

                                    var font = 'bold ' + 96 * this.scale + 'px Helvetica';
                                    this.textWelcome = new createjs.Text(this.stages[currentStage.nextStage].testWelcomePhrase, font, '#FFFFFF');
                                    this.textWelcome.textAlign = 'center';
                                    this.textWelcome.x = this.canvas.width*0.5;
                                    this.textWelcome.y = this.canvas.height*0.5;
                                    this.testStage.addChild(this.textWelcome);
                                    setTimeout(function() {
                                        this.testStage.removeChild(this.textWelcome);
                                    }.bind(this), 2500);

                                    this.resume();
                                    this.testStage.removeChild(this.textGameover);
                                }.bind(this), 2000);
                            }
                        } else if(this.globalSteps <= 0) {
                            // Stage failed
                            this.globalSteps = 0;
                            var font = 'bold ' + 96 * this.scale + 'px Helvetica';
                            this.textGameover = new createjs.Text('G A M E  O V E R', font, '#000000');
                            this.textGameover.textAlign = 'center';
                            this.textGameover.x = this.canvas.width*0.5;
                            this.textGameover.y = this.canvas.height*0.5;
                            this.testStage.addChild(this.textGameover);
                            this.pause();
                        }
                    }

                    // Show info
                    this.stepMeter.graphics.clear();
                    this.stepMeter.graphics.beginFill('rgba(255,255,0,0.5)').drawRect(0, 0, 40*this.scale, Math.map2(this.globalSteps, 0, 1000, 0, this.canvas.height));
                    this.goalMeter.graphics.clear();
                    this.goalMeter.graphics.beginFill('rgba(0,255,255,0.5)').drawRect(this.canvas.width-40*this.scale, 0, 40*this.scale, Math.map2(currentStage.stageLength - this.testPlayer.distanceWalked, 0, currentStage.stageLength, 0, this.canvas.height));

                    this.textStepCount.text = this.globalSteps;
                    this.textScoreCount.text = this.gameScore;
                    this.textGoalCount.text = currentStage.stageLength - this.testPlayer.distanceWalked;
                    break;
            }
        }
        this.testStage.update();
        this.basicGesture.run();
    };

    p.doYourJobEnemies = function() {
        for(var key in this.enemies) {
            this.enemies[key].doYourJob(this.testPlayer);
        }
    };

    p.scrollProps = function() {
        for(var i = 0; i < this.props.length; i++) {
            this.props[i].skin.y += this.props[i].scrollSpeed * this.testPlayer.dps * 2;
        }
    };

    p.pause = function() {
        this.paused = true;
    };

    p.resume = function() {
        this.paused = false;
    };

    p.removeOffBoundaries = function(array) {
        for(var key in array) {
            var one = array[key];
            if (one.getX() + one.width*0.5 < -this.canvas.width*0.3 ||
                one.getX() - one.width*0.5 >= this.canvas.width*1.3 ||
                one.getY() + one.height*0.5 < -this.canvas.height*0.3 ||
                one.getY() - one.height*0.5 >= this.canvas.height*1.3) {
                one.kill();
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
                switch(this.gamePhase['phase']) {
                    case 'TITLE':
                        this.testStage.removeChild(this.bgTitle);
                        this.gamePhase['phase'] = 'IN-STAGE';
                        this.gamePhase['stage'] = 'tutorial-1';

                        // Create test player
                        this.createTestPlayer();
                        this.testPlayer.init = function(stage) {
                            this['distanceWalked'] = 0;
                            this['stepsWalked'] = 0;
                            this['dps'] = stage.defaultDPS;
                        };
                        this.testPlayer.init(this.stages['tutorial-1']);

                        // Stage welcome text
                        var font = 'bold ' + 96 * this.scale + 'px Helvetica';
                        this.textWelcome = new createjs.Text(this.stages[this.gamePhase['stage']].testWelcomePhrase, font, '#FFFFFF');
                        this.textWelcome.textAlign = 'center';
                        this.textWelcome.x = this.canvas.width*0.5;
                        this.textWelcome.y = this.canvas.height*0.5;
                        this.testStage.addChild(this.textWelcome);
                        setTimeout(function() {
                            this.testStage.removeChild(this.textWelcome);
                        }.bind(this), 2500);

                        // Create test texts
                        // this.scoreboard = new createjs.Shape();
                        // this.scoreboard.graphics.beginFill('#FFFFFF').drawRect(0, 0, this.canvas.width, 180*this.scale);
                        // this.testStage.addChild(this.scoreboard);

                        var font = 'bold ' + 36 * this.scale + 'px Helvetica';
                        this.textStep = new createjs.Text('STEP', font, '#444444');
                        this.textStep.textAlign = 'center';
                        this.textStep.x = 150 * this.scale;
                        this.textStep.y = 20 * this.scale;
                        this.testStage.addChild(this.textStep);

                        this.textScore = new createjs.Text('SCORE', font, '#444444');
                        this.textScore.textAlign = 'center';
                        this.textScore.x = 400 * this.scale;
                        this.textScore.y = 20 * this.scale;
                        this.testStage.addChild(this.textScore);

                        this.textGoal = new createjs.Text('GOAL', font, '#444444');
                        this.textGoal.textAlign = 'center';
                        this.textGoal.x = this.canvas.width - 150 * this.scale;
                        this.textGoal.y = 20 * this.scale;
                        this.testStage.addChild(this.textGoal);

                        font = 'bold ' + 72 * this.scale + 'px Helvetica';
                        this.textStepCount = new createjs.Text('-', font, '#FFFFFF');
                        this.textStepCount.textAlign = 'center';
                        this.textStepCount.x = 150 * this.scale;
                        this.textStepCount.y = 75 * this.scale;
                        this.testStage.addChild(this.textStepCount);

                        this.stepMeter = new createjs.Shape();
                        this.testStage.addChildAt(this.stepMeter, 0);

                        this.textScoreCount = new createjs.Text('-', font, '#FFFFFF');
                        this.textScoreCount.textAlign = 'center';
                        this.textScoreCount.x = 400 * this.scale;
                        this.textScoreCount.y = 75 * this.scale;
                        this.testStage.addChild(this.textScoreCount);

                        this.textGoalCount = new createjs.Text('-', font, '#FFFFFF');
                        this.textGoalCount.textAlign = 'center';
                        this.textGoalCount.x = this.canvas.width - 150 * this.scale;
                        this.textGoalCount.y = 75 * this.scale;
                        this.testStage.addChild(this.textGoalCount);

                        this.goalMeter = new createjs.Shape();
                        this.testStage.addChildAt(this.goalMeter, 0);

                        break;
                    case 'IN-STAGE':
                        var enemy, targetX, targetY;
                        targetX = evt.detail.x;
                        targetY = evt.detail.y;
                        enemy = null;
                        enemy = this.box2d.pickEnemy(targetX, targetY, this.canvas.height * 0.05);
                        if(enemy) {
                            if(enemy.tappable) {
                                if(enemy.tappable === true) {
                                    this.gameScore += enemy.point;
                                    enemy.kill();
                                } else {
                                    enemy.tappable();
                                }
                            }
                        }
                        break;
                }
                break;
            case 'gestureswipe':
                switch(this.gamePhase['phase']) {
                    case 'IN-STAGE':
                        var enemy, targetX, targetY;
                        for(var i = -0.2, j = -0.2; i < 1; i += 0.1, j += 0.1) {
                            targetX = evt.detail.sx + (evt.detail.x - evt.detail.sx) * i;
                            targetY = evt.detail.sy + (evt.detail.y - evt.detail.sy) * i;
                            enemy = null;
                            enemy = this.box2d.pickEnemy(targetX, targetY, this.canvas.height * 0.05);
                            if(enemy) {
                                if(enemy.throwable) {
                                    if(enemy.throwable === true) {
                                        enemy.applyImpulse2(evt.detail.swipeAngle, Math.max(evt.detail.swipeDistance*Math.pow(1-i, 2)*0.1, this.canvas.height*0.01));
                                    } else {
                                        enemy.throwable();
                                    }
                                }
                            }
                        }
                        break;
                }
                break;
            case 'gesturehold':
                break;
            case 'gestureholdend':
                break;
        }
    };


    /*  ╔═╗┬─┐┌─┐┌─┐┌┬┐┬┌─┐┌┐┌  ┌┬┐┌─┐┌┬┐┬ ┬┌─┐┌┬┐┌─┐
        ║  ├┬┘├┤ ├─┤ │ ││ ││││  │││├┤  │ ├─┤│ │ ││└─┐
        ╚═╝┴└─└─┘┴ ┴ ┴ ┴└─┘┘└┘  ┴ ┴└─┘ ┴ ┴ ┴└─┘─┴┘└─┘   */
    // p.createTestEnemy = function() {
    //     var dice = Math.random();
    //     if(dice < 0.7) {
    //         var skin = this.imgEnemy['Mundane'][Math.floor(Math.random()*this.imgEnemyMundane.length)].clone();
    //         var body = this.createCircleObject(skin, { x: Math.random()*this.canvas.width, y: -this.canvas.height*0.1, index: 0 });
    //         var rigid = new RigidBody(skin, body).on(this.testStage).with(this.box2d);
    //         this.enemies.push(new GameObject(this, 'Mundane', rigid));
    //     } else if(dice < 0.9) {
    //         var skin = this.imgEnemy['Folder'].clone();
    //         var body = this.createCircleObject(skin, { x: Math.random()*this.canvas.width, y: -this.canvas.height*0.1, index: 0, density: 5 });
    //         var rigid = new RigidBody(skin, body).on(this.testStage).with(this.box2d);
    //         this.enemies.push(new GameObject(this, 'Folder', rigid));
    //     } else {
    //         var skin = this.aniEnemyInbox.clone();
    //         var body = this.createCircleObject(skin, { x: Math.random()*this.canvas.width, y: -this.canvas.height*0.1, index: 0, density: 45 });
    //         var rigid = new RigidBody(skin, body).on(this.testStage).with(this.box2d);
    //         this.enemies.push(new GameObject(this, 'Inbox', rigid));
    //     }
    // };

    p.createTestPlayer = function() {
        var skin = this.aniPlayer;
        var body = this.createCircleObject(skin, {
            x: this.canvas.width * 0.5,
            y: this.canvas.height * 0.8,
            friction: 1.0,
            restitution: 0,
            radius: skin.spriteSheet.getFrameBounds(0).height * this.scale * 0.3,
            static: true
        });
        var rigid = new RigidBody(skin, body).on(this.testStage).with(this.box2d);
        this.testPlayer = new GameObject(this, 'player', rigid);
        skin.gotoAndPlay('walk');
    };


    /*  ╔═╗┬─┐┌─┐┌─┐┌┬┐┬┌─┐┌┐┌  ┌┬┐┌─┐┌┬┐┬ ┬┌─┐┌┬┐┌─┐       ┌┐ ┌─┐─┐ ┬╔═╗┌┬┐
        ║  ├┬┘├┤ ├─┤ │ ││ ││││  │││├┤  │ ├─┤│ │ ││└─┐  ───  ├┴┐│ │┌┴┬┘╔═╝ ││
        ╚═╝┴└─└─┘┴ ┴ ┴ ┴└─┘┘└┘  ┴ ┴└─┘ ┴ ┴ ┴└─┘─┴┘└─┘       └─┘└─┘┴ └─╚═╝─┴┘    */

    // Create circle object with image and options(necessary)
    // Options: x, y, diameter, density, friction, restitution
    p.createCircleObject = function(thing, option) {
        thing.x = option['x'];
        thing.y = option['y'];
        if(thing instanceof createjs.Bitmap) {
            thing.regX = thing.image.width * 0.5;
            thing.regY = thing.image.height * 0.5;
        } else if(thing instanceof createjs.Sprite) {
            thing.regX = thing.spriteSheet.getFrameBounds(0).width * 0.5;
            thing.regY = thing.spriteSheet.getFrameBounds(0).height * 0.5;
        }
        thing.scaleX = this.scale;
        thing.scaleY = this.scale;
        thing.snapToPixel = true;
        if(option['index'] !== undefined) {
            this.testStage.addChildAt(thing, option['index']);
        } else {
            this.testStage.addChild(thing);
        }
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

window.onblur = function() {
    game.box2d.pauseResume(true);
    game.pause();
};

window.onfocus = function() {
    game.box2d.pauseResume(false);
    game.resume();
};

// window.onresize = function() {
//     game.resizeCanvas();
// }