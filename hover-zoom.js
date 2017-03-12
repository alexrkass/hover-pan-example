var registerComponent = require('./node_modules/aframe/src/core/component.js').registerComponent;
var THREE = require('./node_modules/aframe/src/lib/three.js');

// To avoid recalculation
var PI = Math.PI;

module.exports.Component = registerComponent('hover-zoom-look-controls', {
  dependencies: ['position', 'rotation'],

  schema: {
    enabled: { default: true},
    pitch_control_enabled: { default: true},
    maxpitch: {default: PI/2},
    minpitch: {default: -PI/2},
    xZoomModifier: {default: 1},
    yZoomModifier: {default: 1},

  },

  init: function () {
    var scene = this.el.sceneEl;
    this.setupMouseControls();
    this.setupHMDControls();
    this.attachEventListeners();
    scene.addBehavior(this);
    this.previousPosition = new THREE.Vector3();
    this.deltaPosition = new THREE.Vector3();
  },

  setupMouseControls: function () {
    this.canvasEl = document.querySelector('a-scene').canvas;
    this.hovering = false;
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 10;
    this.yawObject.add(this.pitchObject);
  },

  setupHMDControls: function () {
    this.dolly = new THREE.Object3D();
    this.euler = new THREE.Euler();
    this.controls = new THREE.VRControls(this.dolly);
    this.zeroQuaternion = new THREE.Quaternion();
  },

  attachEventListeners: function () {
    var canvasEl = document.querySelector('a-scene').canvas;

    // Mouse Events
    canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
    canvasEl.addEventListener('mouseout', this.onMouseOut.bind(this), true);
    canvasEl.addEventListener('mouseover', this.onMouseOver.bind(this), true);
    // Touch events
    canvasEl.addEventListener('touchstart', this.onTouchStart.bind(this));
    canvasEl.addEventListener('touchmove', this.onTouchMove.bind(this));
    canvasEl.addEventListener('touchend', this.onTouchEnd.bind(this));
    console.log("added");
  },

  update: function () {
    if (!this.data.enabled) { return; }
    this.hoverZoom();
    this.controls.update();
    this.updateOrientation();
    this.updatePosition();
  },

  updateOrientation: (function () {
    var hmdEuler = new THREE.Euler();
    hmdEuler.order = 'YXZ';
    return function () {
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var hmdQuaternion = this.calculateHMDQuaternion();
      hmdEuler.setFromQuaternion(hmdQuaternion);
      this.el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(hmdEuler.x) + THREE.Math.radToDeg(pitchObject.rotation.x),
        y: THREE.Math.radToDeg(hmdEuler.y) + THREE.Math.radToDeg(yawObject.rotation.y),
        z: THREE.Math.radToDeg(hmdEuler.z)
      });
    };
  })(),

  calculateHMDQuaternion: (function () {
    var hmdQuaternion = new THREE.Quaternion();
    return function () {
      var dolly = this.dolly;
      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
        this.zeroOrientation();
        this.zeroed = true;
      }
      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
      return hmdQuaternion;
    };
  })(),

  updatePosition: (function () {
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    return function () {
      var el = this.el;
      var deltaPosition = this.calculateDeltaPosition();
      var currentPosition = el.getComputedAttribute('position');
      this.el.object3D.matrixWorld.decompose(position, quaternion, scale);
      deltaPosition.applyQuaternion(quaternion);
      el.setAttribute('position', {
        x: currentPosition.x + deltaPosition.x,
        y: currentPosition.y + deltaPosition.y,
        z: currentPosition.z + deltaPosition.z
      });
    };
  })(),

  calculateDeltaPosition: function () {
    var dolly = this.dolly;
    var deltaPosition = this.deltaPosition;
    var previousPosition = this.previousPosition;
    deltaPosition.copy(dolly.position);
    deltaPosition.sub(previousPosition);
    previousPosition.copy(dolly.position);
    return deltaPosition;
  },

  updateHMDQuaternion: (function () {
    var hmdQuaternion = new THREE.Quaternion();
    return function () {
      var dolly = this.dolly;
      this.controls.update();
      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
        this.zeroOrientation();
        this.zeroed = true;
      }
      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
      return hmdQuaternion;
    };
  })(),

  zeroOrientation: function () {
    var euler = new THREE.Euler();
    euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
    // Cancel out roll and pitch. We want to only reset yaw
    euler.z = 0;
    euler.x = 0;
    this.zeroQuaternion.setFromEuler(euler);
  },

  getMousePosition: function(event, canvasEl) {

    var rect = canvasEl.getBoundingClientRect();

    // Returns a value from -1 to 1 for (X,Y) representing the percentage of the max-yaw and max-pitch from
    // the center of the canvas, (0,0) being the center -1 is far left or top, 1 is far right or bottom
    return {x: -2*(.5 - (event.clientX - rect.left)/rect.width), y: -2*(.5 - (event.clientY - rect.top)/rect.height)};
  },

  onMouseMove: function (event) {
    var pos = this.getMousePosition(event, this.canvasEl);
    var x = pos.x;
    var y = pos.y;

    this.xZoomSpeed =  (-x/100) * this.data.xZoomModifier;
    this.yZoomSpeed =  (-y/100) * this.data.yZoomModifier;
  },

  hoverZoom: function (event) {

    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;

    if (!this.hovering || !this.data.enabled) { return; }
    if (this.data.pitch_control_enabled && ((pitchObject.rotation.x > this.data.maxpitch && this.yZoomSpeed > 0) || (pitchObject.rotation.x < this.data.minpitch && this.yZoomSpeed < 0))) {console.log("fail"); return;}
    yawObject.rotation.y += this.xZoomSpeed;
    pitchObject.rotation.x += this.yZoomSpeed;
     console.log("yawObject = "+ yawObject.rotation.y + "and pitchObject = "+pitchObject.rotation.x);
  },

  onMouseOver: function (event) {
    this.hovering = true;
  },

  onMouseOut: function (event) {
    this.hovering = false;
  },

  onTouchStart: function (e) {
    if (e.touches.length !== 1) { return; }
    this.touchStart = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };
    this.touchStarted = true;
  },

  onTouchMove: function (e) {
    var deltaY;
    var yawObject = this.yawObject;
    if (!this.touchStarted) { return; }
    deltaY = 2 * Math.PI * (e.touches[0].pageX - this.touchStart.x) / this.canvasEl.clientWidth;
    // Limits touch orientaion to to yaw (y axis)
    yawObject.rotation.y -= deltaY * 0.5;
    this.touchStart = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };
  },

  onTouchEnd: function () {
    this.touchStarted = false;
  }
});
