var game;

(function(scope) {
	function Game() {
		this.initialize();
	}
	var p = Game.prototype;
	var debug = true;


	/*	╔═╗┌─┐┌─┐┌─┐┌┬┐┌─┐
		╠═╣└─┐└─┐├┤  │ └─┐
		╩ ╩└─┘└─┘└─┘ ┴ └─┘	*/

	// Images for emenies
	var IMG_ENEMIES = [
		'./assets/images/enemies/e0.png',
		'./assets/images/enemies/e1.png',
		'./assets/images/enemies/e2.png',
		'./assets/images/enemies/e3.png',
		'./assets/images/enemies/e4.png',
		'./assets/images/enemies/e5.png'
	];

	// Combine all the assets
	var ASSETS = [].concat(IMG_ENEMIES);


	/*	╦┌┐┌┬┌┬┐┬┌─┐┬  ┬┌─┐┌─┐
		║││││ │ │├─┤│  │┌─┘├┤ 
		╩┘└┘┴ ┴ ┴┴ ┴┴─┘┴└─┘└─┘	*/
	p.initialize = function() {
		if(debug) console.log('Initializing Game..');

		// Set up a canvas
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('style', 'position:absolute; z-index:1;');
		this.canvas.id = 'gameCanvas';
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.context = this.canvas.getContext('2d');
		document.body.appendChild(this.canvas);

		// Set up a debug canvas
		this.debugCanvas = document.createElement('canvas');
		this.debugCanvas.setAttribute('style', 'position:absolute; z-index:2;');
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
		this.testStage.addEventListener('gesturetap', this.handleGesture.bind(this));
		this.testStage.addEventListener('gestureswipe', this.handleGesture.bind(this));
		this.testStage.addEventListener('gesturehold', this.handleGesture.bind(this));
		this.testStage.addEventListener('gestureholdend', this.handleGesture.bind(this));

		// Load assets
		this.assets = new AssetFactory();
		this.assets.onComplete = this.assetsLoaded.bind(this);
		this.assets.loadAssets(ASSETS);

		// Initialize Box2D
		this.box2d = new Box2d4Easeljs(this);
	};


	/*	╔═╗┬  ┬┌─┐┬─┐┬ ┬┌┬┐┬ ┬┬┌┐┌┌─┐  ┬┌─┐  ┬─┐┌─┐┌─┐┌┬┐┬ ┬┬
		║╣ └┐┌┘├┤ ├┬┘└┬┘ │ ├─┤│││││ ┬  │└─┐  ├┬┘├┤ ├─┤ ││└┬┘│
		╚═╝ └┘ └─┘┴└─ ┴  ┴ ┴ ┴┴┘└┘└─┘  ┴└─┘  ┴└─└─┘┴ ┴─┴┘ ┴ o	*/
	p.assetsLoaded = function() {
		if(debug) console.log('.. assets are loaded');

		// Assign images
		this.imgEnemy = [];
		for(var i = 0; i < IMG_ENEMIES.length; i++) {
			this.imgEnemy.push(new createjs.Bitmap(this.assets[IMG_ENEMIES[i]]));
		}

		// Set Ticker
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
	};


	/*	╦  ┌─┐┌─┐┌─┐
		║  │ ││ │├─┘
		╩═╝└─┘└─┘┴  	*/
	p.onTick = function() {
		this.testStage.update();
		this.basicGesture.run();
	};


	/*	╦ ╦┌─┐┌┐┌┌┬┐┬  ┌─┐  ┌┬┐┌─┐┬ ┬┌─┐┬ ┬┌─┐┌─┐
		╠═╣├─┤│││ │││  ├┤    │ │ ││ ││  ├─┤├┤ └─┐
		╩ ╩┴ ┴┘└┘─┴┘┴─┘└─┘   ┴ └─┘└─┘└─┘┴ ┴└─┘└─┘	*/
	p.handleGesture = function(evt) {

	};


	/*	╦═╗┌─┐┌─┐┬┌─┐┌─┐  ┌─┐┌─┐┌┐┌┬  ┬┌─┐┌─┐
		╠╦╝├┤ └─┐│┌─┘├┤   │  ├─┤│││└┐┌┘├─┤└─┐
		╩╚═└─┘└─┘┴└─┘└─┘  └─┘┴ ┴┘└┘ └┘ ┴ ┴└─┘	*/
	p.resizeCanvas = function(evt) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.debugCanvas.width = window.innerWidth;
		this.debugCanvas.height = window.innerHeight;
	};

	scope.Game = Game;
}(window));

window.onload = function() {
	game = new Game();
};

window.onresize = function() {
	game.resizeCanvas();
}