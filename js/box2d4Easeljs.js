/*
  ____            ____     _   _  _     _____               _  _     
 | __ )  _____  _|___ \ __| | | || |   | ____|__ _ ___  ___| |(_)___ 
 |  _ \ / _ \ \/ / __) / _` | | || |_  |  _| / _` / __|/ _ \ || / __|
 | |_) | (_) >  < / __/ (_| | |__   _| | |__| (_| \__ \  __/ || \__ \
 |____/ \___/_/\_\_____\__,_|    |_|   |_____\__,_|___/\___|_|/ |___/
                                                            |__/     
  A helper class for using Box2dWeb with Easeljs
   Written by Jaewoong Hwang(http://jaewoong.info)
    based on from Justin Schrader's tutorial(http://www.luxanimals.com/blog/article/combining_easel_box2d)
     April 2014
*/

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
        floorFixture.friction = 0.5;
        floorFixture.restitution = 0.5;
        floorFixture.shape = new b2PolygonShape;
        floorFixture.shape.SetAsBox(mother.canvas.width / this.SCALE, mother.canvas.height*0.01 / this.SCALE);
        var floorBodyDef = new b2BodyDef;
        floorBodyDef.type = b2Body.b2_staticBody;
        floorBodyDef.position.x = 0 / this.SCALE;
        floorBodyDef.position.y = mother.canvas.height * 0.99 / this.SCALE;
        var floor = this.world.CreateBody(floorBodyDef);
        floor.CreateFixture(floorFixture);
    };

    // Box2d debugger
    p.addDebug = function() {
        this.debugDraw = new b2DebugDraw();
        this.debugDraw.SetSprite(this.mother.debugContext);
        this.debugDraw.SetDrawScale(this.SCALE);
        this.debugDraw.SetFillAlpha(0.7);
        this.debugDraw.SetLineThickness(1.0);
        this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(this.debugDraw);
    };

    // Actor object: be aware of context when calling this
    p.actorObject = function(b2d, body, skin) {
        this.body = body;
        this.skin = skin;
        this.update = function() {
            // Translate box2d positoin to pixels
            this.skin.rotation = this.body.GetAngle() * (180 / Math.PI);
            this.skin.x = this.body.GetWorldCenter().x * b2d.SCALE;
            this.skin.y = this.body.GetWorldCenter().y * b2d.SCALE;
        }
        b2d.actors.push(this);
    };

    // Remove actor and its skin object
    p.removeActor = function(actor, stage) {
        var stage = stage || this.mother.stage;
        stage.removeChild(actor.skin);
        this.actors.splice(this.actors.indexOf(actor), 1);
    };

    // Create and add circle
    p.createCircle = function(skin, option) {
        var option = option || {};
        var fixture = new b2FixtureDef;
        fixture.density = option['density'] || 1;
        fixture.friction = option['friction'] || 0.5;
        fixture.restitution = option['restitution'] || 0.2;
        fixture.shape = new b2CircleShape((option['dia'] || 24) / this.SCALE);
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = skin.x / this.SCALE;
        bodyDef.position.y = skin.y / this.SCALE;
        var thing = this.world.CreateBody(bodyDef);
        thing.CreateFixture(fixture);

        // Assign actor
        var Actor = this.actorObject.bind({});
        var actor = new Actor(this, thing, skin);
        thing.SetUserData(actor);
        this.bodies.push(thing);
    }

    // Box2d update function
    // Delta time is used to avoid differences in simulation if frame rate drops
    p.update = function() {
        var now = Date.now();
        var dt = now - this.lastTimestamp;
        this.fixedTimestepAccumulator += dt;
        this.lastTimestamp = now;
        while(this.fixedTimestepAccumulator >= this.STEP) {
            // Remove bodies first
            for(var i = 0, l = this.bodiesToRemove.length; i < l; i++) {
                this.removeActor(this.bodiesToRemove[i].GetUserData());
                this.bodiesToRemove[i].SetUserData(null);
                this.world.DestroyBody(bodiesToRemove[i]);
            }
            bodiesToRemove = [];

            // Update active actors
            for(var i = 0, l = this.actors.length; i < l; i++) {
                this.actors[i].update();
            }

            this.world.Step(this.TIMESTEP, 10, 10);

            this.fixedTimestepAccumulator -= this.STEP;
            this.world.ClearForces();
            this.world.m_debugDraw.m_sprite.graphics.clear();
            this.world.DrawDebugData();
        };
    };

    // Pause or resume the physics
    p.pauseResume = function(p) {
        if(p) {
            this.TIMESTEP = 0;
        } else {
            this.TIMESTEP = 1 / this.STEP;
        }
        this.lastTimestamp = Date.now();
    };

    scope.Box2d4Easeljs = Box2d4Easeljs;
}(window));