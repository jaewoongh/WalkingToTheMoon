(function(scope) {
	function Game() {
		this.initialize();
	}
	var p = Game.prototype;

	// Assets

	p.initialize = function() {
		// Set up a canvas
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'gameCanvas';
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		document.body.appendChild(this.canvas);

		// Create stage and enable touch and gesture
		this.testStage = new createjs.Stage(this.canvas);
		createjs.Touch.enable(this.testStage);
		this.basicGesture = new basicGesture(this.testStage);
		this.testStage.addEventListener('gesturetap', this.handleGesture.bind(this));
		this.testStage.addEventListener('gestureswipe', this.handleGesture.bind(this));
		this.testStage.addEventListener('gesturehold', this.handleGesture.bind(this));
		this.testStage.addEventListener('gestureholdend', this.handleGesture.bind(this));
	};

	p.assetsLoaded = function() {

		// Set Ticker
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
	};

	p.onTick = function() {
		this.testStage.update();
		this.basicGesture.run();
	};

	p.handleGesture = function(evt) {

	};

	scope.Game = Game;
}(window));

window.onload = function() {
	new Game();
};