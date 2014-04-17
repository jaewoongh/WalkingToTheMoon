(function(scope) {
	function Box2d4Easeljs(mother, option) {
		this.initialize(mother, option);
	}
	var p = Box2d4Easeljs.prototype;

	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var b2BodyDef = Box2D.Dynamics.b2BodyDef;
	var b2Body = Box2D.Dynamics.b2Body;
	var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	var b2Fixture = Box2D.Dynamics.b2Fixture;
	var b2World = Box2D.Dynamics.b2World;
	var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
	var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	p.initialize = function(mother, option) {
		this.mother = mother;
		option = option || {};

		// Important Box2d scale and speed variables
		this.SCALE = option['SCALE'] || 30;
		this.STEP = option['STEP'] || 20;
		this.TIMESTEP = 1 / this.STEP;

		// Global-ish variables
		this.world;
		this.lastTimestamp = Date.now();
		this.fixedTimestepAccumulator = 0;
		this.bodiesToRemove = [];
		this.actors = [];
		this.bodies = [];

		// Set up initial settings
		this.world = new b2World(new b2Vec2(0, 10), true);
		this.addDebug();

		// Add floor for the sake of test
		var floorFixture = new b2FixtureDef;
		floorFixture.density = 1;
		floorFixture.restitution = 1;
		floorFixture.shape = new b2PolygonShape;
		floorFixture.shape.SetAsBox(550 / this.SCALE, 10 / this.SCALE);
		var floorBodyDef = new b2BodyDef;
		floorBodyDef.type = b2Body.b2_staticBody;
		floorBodyDef.position.x = -25 / this.SCALE;
		floorBodyDef.position.y = 509 / this.SCALE;
		var floor = this.world.CreateBody(floorBodyDef);
		floor.CreateFixture(floorFixture);
	};

	p.addDebug = function() {
		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(this.mother.debugContext);
		debugDraw.SetDrawScale(this.SCALE);
		debugDraw.SetFillAlpha(0.7);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(debugDraw);
	};

	scope.Box2d4Easeljs = Box2d4Easeljs;
}(window));