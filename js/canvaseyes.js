/*
* Constructor for the canvas eyes. 
* @this {CanvasEyes}
* @param {Element} element the element which the eyes should use to render the canvas
* @param {Object} config an object holding the configuration for the eyes. See config function.
*           
*/
CanvasEyes = function(element, config) {
   
    if(typeof(element) == "string") {
        this.element = document.getElementById(element);
    } else {
        this.element = element;
    }
    this.leftEye = {};
    this.rightEye = {};
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.radius = 100;
    this.mouseX = 0;
    this.mouseY = 0;
    this.pointerLayer = 600;
    this.image = './img/eye.png';
    if(config != null) {
        this.config(config);
    } else {
        this.config({});
    }
    
};

/*
* Renders the eyes onto the specified element
*/
CanvasEyes.prototype.render = function() {
    //what is this doing with the width / height?
    //field of view (what should this be?) 
    //Aspect ratio (this is right)
    //near point (this is right)
    //far point (should this be the same as the pointer layer?)
    this.camera = new THREE.Camera( 60, this.width / this.height, 0.0001, 1000 );
    this.camera.position.z = 500;

    this.scene = new THREE.Scene();

    this.leftEye = this.createEye(-this.radius, this.radius);
    this.scene.addObject(this.leftEye.eye);

    this.rightEye = this.createEye(this.radius, this.radius);
    this.scene.addObject(this.rightEye.eye);


    this.renderer = new THREE.CanvasRenderer();
    //TODO find out what this needs as a size
    this.renderer.setSize( this.width, this.height);

    this.element.appendChild(this.renderer.domElement);

    document.addEventListener('mousemove', this.getMouseMoveFunction(), false);
    this.startLoop();

};

/*
* Creates the eyes using the supplied parameters.
*/
CanvasEyes.prototype.createEye = function(xPosition, radius) {
    return new Eye(xPosition, radius, this);
};

/*
* Starts the loop that updates the direction that the eye is looking in.
*/
CanvasEyes.prototype.startLoop = function() {
    var me = this;
    
    var loopFunction = function() {
            var pointerPosition = {x:me.mouseX,y:me.mouseY,z:me.pointerLayer};
            me.leftEye.lookAt(pointerPosition);
            me.rightEye.lookAt(pointerPosition);
            me.renderer.render(me.scene, me.camera);            
        };
    setInterval( loopFunction, 1000 / 60 );
};

/*
* Loads the eye image onto the canvas
*/
CanvasEyes.prototype.loadImage = function( path ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = 32;
    canvas.height = 32;

    var material =  new THREE.MeshBitmapUVMappingMaterial( canvas );

    var image = new Image();

    image.onload = function () {
        material.bitmap = this;
    };

    image.src = path;

    return material;

}

/*
* gets the function that listens to the mouse move event and updates the mouse coordinates.
*/
CanvasEyes.prototype.getMouseMoveFunction = function() {
    var me = this;
    var mouseMoveFunction = function(event) {
        var canvasRegion = YAHOO.util.Dom.getRegion(me.element);
        var mouseXPosition = event.clientX;
        var mouseYPosition = event.clientY;
        me.mouseX = mouseXPosition - (me.width / 2 ) - canvasRegion.left;
        me.mouseY = (me.height / 2 ) - mouseYPosition + canvasRegion.top;
    };
    return mouseMoveFunction;
};

/*
* Specify the configuration for the eyes.
* --------------------------------------------------------------------------------------
* | param        | value  | default                                                    |
* --------------------------------------------------------------------------------------
* | height       | number | automatically sizes the canvas so that the eyes can fit    |
* | width        | number | automatically sizes the canvas so that the eyes can fit    |
* | radius       | number | 100                                                        |
* | pointerLayer | number | 600                                                        |
* | image        | string | the image used for the eye, it defaults to './img/eye.png' |
* --------------------------------------------------------------------------------------
* TODO Add in a custom image for the eye
* @param config a map of configuration items. currently
* 
*/
CanvasEyes.prototype.config = function(config) {
    if(config != null) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        if(config["radius"] != null) {
            this.radius = config.radius;
        }
        if(config["pointerLayer"] != null) {
            this.pointerLayer = config.pointerLayer;
        }
        if(config["image"] != null) {
            this.image = config.image;
        }
        if(config["height"] != null) {
            this.height = config.height;
        } else {
            this.height = (this.radius * 16) + 10;
        }
        if(config["width"] != null) {
            this.width = config.width;
        } else {
            this.width = (this.radius * 16) + 10;
        }
    }
};


Eye = function(xPosition, radius, canvas) {
     var eye = {};
    //create the eyeball
    this.eye = new THREE.Mesh( new Sphere( radius, 20, 20 ), canvas.loadImage( canvas.image ) );
    this.eye.position.x = xPosition;
    this.eye.rotation.y =  (Math.PI / 2);
    this.eye.radius = radius;
    this.center = {x: xPosition, y: 0, z: 0};
    this.element = canvas.element;
};

/*
* Makes the eye look at the coordinate.
* This calculates the x and y rotation for the eye
* the rotation is measured in radians so you just use
* simple triganometry to calculate the angle.
* @param coords the coordinates for the eye to look at
*/
Eye.prototype.lookAt = function(coords) {
    //TODO correct the eye coordinate for the camera position
    var oppositex = coords.x - this.center.x;
    var adjacentx = coords.z;
    //(Math.PI / 2) corrects the angle since the eye is initially rotated to look left
    var anglex = Math.atan(oppositex/adjacentx) + (Math.PI / 2);
    this.eye.rotation.y = anglex;
    
    var oppositey = coords.y - this.center.y;
    var adjacenty = coords.z;
    var angley = Math.atan(oppositey/adjacenty);
    this.eye.rotation.x = -angley;
    
};
