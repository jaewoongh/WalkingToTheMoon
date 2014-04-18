/*
  ____            _         ____           _                  
 | __ )  __ _ ___(_) ___   / ___| ___  ___| |_ _   _ _ __ ___ 
 |  _ \ / _` / __| |/ __| | |  _ / _ \/ __| __| | | | '__/ _ \
 | |_) | (_| \__ \ | (__  | |_| |  __/\__ \ |_| |_| | | |  __/
 |____/ \__,_|___/_|\___|  \____|\___||___/\__|\__,_|_|  \___|

  A helper class for using touch gestures with Easeljs
   Written by Jaewoong Hwang(http://jaewoong.info)
    April 2014

    This piece of code generates and dispatches multi touch gesture events to a stage
    easeljs_cocoonjs_touchfix.js by Olaf J. Horstmann is considered to be used for cocoon.js support
    There seems to be an issue of using this fix though; stagemousemove event never fires
 
    List of Events:
        Event { type: 'gesturestart',   detail: { sx: [START X], sy: [START Y], x: [CURRENT X], y: [CURRENT Y] } }
        Event { type: 'gesturetap',     detail: { sx: [START X], sy: [START Y], x: [CURRENT X], y: [CURRENT Y] } }
        Event { type: 'gestureswipe',   detail: { sx: [START X], sy: [START Y], x: [CURRENT X], y: [CURRENT Y], swipeAngle: [SWIPE ANGLE IN DEGREES], swipeDistance: [SQUARED SWIPE DISTANCE] } }
        Event { type: 'gesturehold',    detail: { sx: [START X], sy: [START Y], x: [CURRENT X], y: [CURRENT Y], holdTime:   [HOLDING TIME IN MILLISECONDS] } }
        Event { type: 'gestureholdend', detail: { sx: [START X], sy: [START Y], x: [CURRENT X], y: [CURRENT Y], holdTime:   [HOLDING TIME IN MILLISECONDS] } }
 
    Example Usage:
        // Create stage and enable touch
        this.stage = new createjs.Stage('canvas');
        createjs.Touch.enable(this.stage);
 
        // Make BasicGesture for the stage and attach event listeners
        this.basicGesture = new BasicGesture(this.stage);
        this.stage.addEventListener('gesturestart',   this.handleGesture.bind(this));
        this.stage.addEventListener('gesturetap',     this.handleGesture.bind(this));
        this.stage.addEventListener('gestureswipe',   this.handleGesture.bind(this));
        this.stage.addEventListener('gesturehold',    this.handleGesture.bind(this));
        this.stage.addEventListener('gestureholdend', this.handleGesture.bind(this));
 
        // BasicGesture needs to be run() somewhere in the code dealing with tick
        p.onTick = function(evt) {
            this.stage.update();
            this.basicGesture.run();
        };
 
    You can set custom options of deciding which gesture is which, like:
        this.basicGesture.setOptions({
            this.holdThreshold:  500,        // If a touch lasts longer than this, it's a hold (in milliseconds)
            this.swipeThreshold: 20          // If a distance between start and end point of a touch is further than this, it's a swipe
        });
 
    Accessing current touch data before any event is dispatched is also possible
    by iterating through BasicGesture object and matching if it's an instance of SingleGesture
    SingleGesture has some useful parameters like; sx, sy for start coordinate, x, y for current coordinte, and sTime for started time
 
    Example Usage:
        // Assume that there is a BasicGesture object tied to stage
        this.basicGesture = new BasicGesture(this.stage);
 
        // Iterate through and check all the SingleGesture happening now
        for(var i in this.basicGesture) {
            if(this.basicGesture[i] instanceof SingleGesture) console.log(this.basicGesture[i]);
        }
 */


/*  ╔╗ ┌─┐┌─┐┬┌─┐╔═╗┌─┐┌─┐┌┬┐┬ ┬┬─┐┌─┐  ┌─┐┬  ┌─┐┌─┐┌─┐
    ╠╩╗├─┤└─┐││  ║ ╦├┤ └─┐ │ │ │├┬┘├┤   │  │  ├─┤└─┐└─┐
    ╚═╝┴ ┴└─┘┴└─┘╚═╝└─┘└─┘ ┴ └─┘┴└─└─┘  └─┘┴─┘┴ ┴└─┘└─┘ */
(function(scope) {
    // BasicGesture is the main class that need to be run() on every tick
    // It creates and stores SingleGesture objects to keep track of many touches
    function BasicGesture(stage) {
        this.initialize(stage);
    }
    var p = BasicGesture.prototype;


    /*  ╦┌┐┌┬┌┬┐┬┌─┐┬  ┬┌─┐┌─┐
        ║││││ │ │├─┤│  │┌─┘├┤ 
        ╩┘└┘┴ ┴ ┴┴ ┴┴─┘┴└─┘└─┘  */
    p.initialize = function(stage) {
        // Add event listeners to the stage
        this.stage = stage;
        this.stage.addEventListener('stagemousedown', this.start.bind(this));
        this.stage.addEventListener('stagemousemove', this.move.bind(this));
        this.stage.addEventListener('stagemouseup',   this.end.bind(this));

        // Set default options
        this.setOptions({
            holdThreshold:  500,                                                            // If a touch lasts longer than this, it's a hold
            swipeThreshold: this.stage.canvas.height * 0.05     // If a distance between start and end point of a touch is further than this, it's a swipe
        });
    };

    p.setOptions = function(options) {
        this.holdThreshold  = options.holdThreshold;
        this.swipeThreshold = options.swipeThreshold;
    };


    /*  ╦═╗┬ ┬┌┐┌
        ╠╦╝│ ││││
        ╩╚═└─┘┘└┘   */
    p.run = function() {
        // Should be run on every tick
        for(var i in this) {
            if(this[i] instanceof SingleGesture) this[i].run();
        }
    };


    /*  ╦ ╦┌─┐┌┐┌┌┬┐┬  ┌─┐  ┌─┐┬  ┬┌─┐┌┐┌┌┬┐┌─┐
        ╠═╣├─┤│││ │││  ├┤   ├┤ └┐┌┘├┤ │││ │ └─┐
        ╩ ╩┴ ┴┘└┘─┴┘┴─┘└─┘  └─┘ └┘ └─┘┘└┘ ┴ └─┘ */
    p.start = function(evt) {
        // Touch start: make new SingleGestures and start it
        this.easelEvent = evt;
        var cTouches = evt.nativeEvent.changedTouches;
        if(cTouches) {
            for(var i = 0; i < cTouches.length; i++) {
                this[cTouches[i].identifier] = new SingleGesture(this);
                this[cTouches[i].identifier].start(cTouches[i]);
            }
        } else {
            // Deal with mouse events too
            this['mouse'] = new SingleGesture(this);
            this['mouse'].start(evt.nativeEvent);
        }
    };

    p.move = function(evt) {
        // Touch move: update changed SingleGestures
        var cTouches = evt.nativeEvent.changedTouches;
        if(cTouches) {
            for(var i = 0; i < cTouches.length; i++) {
                this[cTouches[i].identifier].move(cTouches[i]);
            }
        } else {
            // Deal with mouse events too
            if(this['mouse'] instanceof SingleGesture) this['mouse'].move(evt.nativeEvent);
        }
    };

    p.end = function(evt) {
        // Touch end: end SingleGestures and delete it
        var cTouches = evt.nativeEvent.changedTouches;
        if(cTouches) {
            for(var i = 0; i < cTouches.length; i++) {
                this[cTouches[i].identifier].end(cTouches[i]);
                delete this[cTouches[i].identifier];
            }
        } else {
            // Deal with mouse events too
            if(this['mouse']){
                this['mouse'].end(evt.nativeEvent);
                delete this['mouse'];
            }
        }
    };

    scope.BasicGesture = BasicGesture;
}(window));


/*  ╔═╗┬┌┐┌┌─┐┬  ┌─┐╔═╗┌─┐┌─┐┌┬┐┬ ┬┬─┐┌─┐  ┌─┐┬  ┌─┐┌─┐┌─┐
    ╚═╗│││││ ┬│  ├┤ ║ ╦├┤ └─┐ │ │ │├┬┘├┤   │  │  ├─┤└─┐└─┐
    ╚═╝┴┘└┘└─┘┴─┘└─┘╚═╝└─┘└─┘ ┴ └─┘┴└─└─┘  └─┘┴─┘┴ ┴└─┘└─┘  */
(function(scope) {
    // SingleGesture is a class for BasicGesture under the hood but you can access to SingleGesture if you would
    // The class is to store detailed data for one touch
    function SingleGesture(mother) {
        this.initialize(mother);
    }
    var p = SingleGesture.prototype;


    /*  ╦┌┐┌┬┌┬┐┬┌─┐┬  ┬┌─┐┌─┐
        ║││││ │ │├─┤│  │┌─┘├┤ 
        ╩┘└┘┴ ┴ ┴┴ ┴┴─┘┴└─┘└─┘  */
    p.initialize = function(mother) {
        this.mother = mother;
        this.touching = false;
        this.holding = false;
        this.sTime;
        this.eTime;
        this.holdThreshold = mother.holdThreshold;
        this.swipeThreshold = mother.swipeThreshold;
    };


    /*  ╦═╗┬ ┬┌┐┌
        ╠╦╝│ ││││
        ╩╚═└─┘┘└┘   */
    p.run = function() {
        // On every tick, check and track the touch status to tell if it's hold
        if(this.touching) {
            if(Date.now() - this.sTime >= this.holdThreshold) {
                this.holding = true;
                this.sendEvent('gesturehold', {holdTime: Date.now() - this.sTime});
            }
        }
    };


    /*  ╦ ╦┌─┐┌┐┌┌┬┐┬  ┌─┐  ┌─┐┬  ┬┌─┐┌┐┌┌┬┐┌─┐
        ╠═╣├─┤│││ │││  ├┤   ├┤ └┐┌┘├┤ │││ │ └─┐
        ╩ ╩┴ ┴┘└┘─┴┘┴─┘└─┘  └─┘ └┘ └─┘┘└┘ ┴ └─┘ */
    p.start = function(touch) {
        // Start new touch
        this.sTime = Date.now();
        this.sx = this.x = touch.pageX;
        this.sy = this.y = touch.pageY;
        this.touching = true;

        this.sendEvent('gesturestart');
    };

    p.move = function(touch) {
        // Update coordinates
        this.x = touch.pageX;
        this.y = touch.pageY;
    };

    p.end = function(touch) {
        // End touch
        this.eTime = Date.now();
        this.x = this.ex = touch.pageX;
        this.y = this.ey = touch.pageY;
        this.touching = false;

        if(this.holding) {
            this.holding = false;
            this.sendEvent('gestureholdend', {holdTime: Date.now() - this.sTime});
            return;
        }

        var dsq = Math.pow(this.sx-this.ex, 2) + Math.pow(this.sy-this.ey, 2);
        var dt = this.eTime - this.sTime;
        if(dsq < Math.pow(this.swipeThreshold, 2)) {
            this.sendEvent('gesturetap');
        } else {
            this.sendEvent('gestureswipe', {swipeAngle: Math.atan2(this.ey - this.sy, this.ex - this.sx)*360/Math.PI/2, swipeDistance: dsq});
        }
    };


    /*  ╔╦╗┬┌─┐┌─┐┌─┐┌┬┐┌─┐┬ ┬  ┌─┐┬  ┬┌─┐┌┐┌┌┬┐
         ║║│└─┐├─┘├─┤ │ │  ├─┤  ├┤ └┐┌┘├┤ │││ │ 
        ═╩╝┴└─┘┴  ┴ ┴ ┴ └─┘┴ ┴  └─┘ └┘ └─┘┘└┘ ┴     */
    p.sendEvent = function(type, detail) {
        // Make and dispatch event to the stage
        detail = detail || {};
        var evt = new CustomEvent(
            type,
            {
                detail: {
                    sx:            this.sx,
                    sy:            this.sy,
                    x:             this.x,
                    y:             this.y,
                    swipeAngle:    detail.swipeAngle,
                    swipeDistance: detail.swipeDistance,
                    holdTime:      detail.holdTime,
                    easelEvent:    this.mother.easelEvent
                },
                bubbles:    true,
                cancelable: true
            }
        );

        this.mother.stage.dispatchEvent(evt);
    };

    scope.SingleGesture = SingleGesture;
}(window));