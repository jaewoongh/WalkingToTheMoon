(function(scope) {
	function TouchTest() {
		this.initialize();
	}

	// Assets
	var TAP		= './assets/images/gesture_tap.png',
			SWIPE	= './assets/images/gesture_rswipe.png',
			HOLD	= './assets/images/gesture_hold.png';
	var ASSETS = [TAP, SWIPE, HOLD];

	var p = TouchTest.prototype;

	p.initialize = function() {
		// Set up canvas
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'canvas';
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		document.body.appendChild(this.canvas);

		// Create stage and enable touch and gesture
		this.testStage = new createjs.Stage(this.canvas);
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
	};

	p.assetsLoaded = function() {
		// Assign images
		this.imgTap					= new createjs.Bitmap(this.assets[TAP]);
		this.imgTap.regX		= this.imgTap.image.width 	*0.5;
		this.imgTap.regY		= this.imgTap.image.height	*0.5;
		this.imgSwipe				= new createjs.Bitmap(this.assets[SWIPE]);
		this.imgSwipe.regX	= this.imgSwipe.image.width	*0.5;
		this.imgSwipe.regY	= this.imgSwipe.image.height*0.5;
		this.imgHold				= new createjs.Bitmap(this.assets[HOLD]);
		this.imgHold.regX		= this.imgHold.image.width	*0.5;
		this.imgHold.regY		= this.imgHold.image.height	*0.5;

		// Set Ticker
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
	};

	p.onTick = function(evt) {
		this.testStage.update();
		this.basicGesture.run();
	};

	p.handleGesture = function(evt) {
		var imgGesture;
		switch(evt.type) {
			case 'gesturetap':
				imgGesture = this.imgTap.clone();
				imgGesture.x = evt.detail.x;
				imgGesture.y = evt.detail.y;
				setTimeout((function() {this.testStage.removeChild(imgGesture);}).bind(this), 150);
				break;
			case 'gestureswipe':
				imgGesture = this.imgSwipe.clone();
				imgGesture.x = evt.detail.sx;
				imgGesture.y = evt.detail.sy;
				imgGesture.rotation = evt.detail.swipeAngle;
				setTimeout((function() {this.testStage.removeChild(imgGesture);}).bind(this), 150);
				break;
			case 'gesturehold':
				imgGesture = this.imgHold.clone();
				imgGesture.x = evt.detail.x;
				imgGesture.y = evt.detail.y;
				setTimeout((function() {this.testStage.removeChild(imgGesture);}).bind(this), 150);
				break;
			case 'gestureholdend':
				break;
			default:
				throw('Basic Gesture event type exception: ' + evt.type);
		}
		this.testStage.addChild(imgGesture);
	};

	scope.TouchTest = TouchTest;
}(window));

window.onload = function() {
	new TouchTest();
};