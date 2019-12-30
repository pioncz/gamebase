import Utils from "./utils/utils";
import { EASING, } from "./utils/animations";
import Config from 'config.js';

export default class Dice {
  constructor({id, container, context, colors = [], }) {
    this.id = id;
    this.container = container;
    this.animations = context.animations;
    this.animationLength = null;
    this.colors = colors;

    var geometry = new THREE.Geometry();
    var size = 10;
    var radius = 0.8;
    // create an array of vertices by way of
    // and array of vector3 instances
    geometry.vertices.push(
      new THREE.Vector3(0, radius, 0),
      new THREE.Vector3(size, radius, 0),
      new THREE.Vector3(size, (size + radius), 0),
      new THREE.Vector3(0, (size + radius), 0),

      new THREE.Vector3(0, radius, -(size + 2 * radius)),
      new THREE.Vector3(size, radius, -(size + 2 * radius)),
      new THREE.Vector3(size, (size + radius), -(size + 2 * radius)),
      new THREE.Vector3(0, (size + radius), -(size + 2 * radius)),

      new THREE.Vector3(-radius, radius, -radius),
      new THREE.Vector3(-radius, radius, -(radius + size)),
      new THREE.Vector3(-radius, (size + radius), -radius),
      new THREE.Vector3(-radius, (size + radius) ,-(radius + size)),

      new THREE.Vector3(size + radius, radius, -radius),
      new THREE.Vector3(size + radius, radius, -(radius + size)),
      new THREE.Vector3(size + radius, (size + radius), -radius),
      new THREE.Vector3(size + radius, (size + radius) ,-(radius + size)),

      new THREE.Vector3(0, 0, -radius),
      new THREE.Vector3(size, 0, -radius),
      new THREE.Vector3(0, 0, -(size+radius)),
      new THREE.Vector3(size, 0, -(size+radius)),

      new THREE.Vector3(0, (size + 2 * radius), -radius),
      new THREE.Vector3(size, (size + 2 * radius), -radius),
      new THREE.Vector3(0, (size + 2 * radius), -(size+radius)),
      new THREE.Vector3(size, (size + 2 * radius), -(size+radius)),
    );

    // create faces by way of an array of
    // face3 instances. (you just play connect
    // the dots with index values from the
    // vertices array)
    geometry.faces.push(
      // basic walls
      new THREE.Face3(0, 1, 2),
      new THREE.Face3(3, 0, 2),

      new THREE.Face3(4, 6, 5),
      new THREE.Face3(7, 6, 4),

      new THREE.Face3(9, 8, 10),
      new THREE.Face3(9, 10, 11),

      new THREE.Face3(12, 13, 14),
      new THREE.Face3(14, 13, 15),

      new THREE.Face3(17, 16, 18),
      new THREE.Face3(17, 18, 19),

      new THREE.Face3(20, 21, 22),
      new THREE.Face3(22, 21, 23),

      // sides vertical
      new THREE.Face3(0, 3, 8),
      new THREE.Face3(8, 3, 10),

      new THREE.Face3(7, 4, 9),
      new THREE.Face3(7, 9, 11),

      new THREE.Face3(12, 14, 1),
      new THREE.Face3(1, 14, 2),

      new THREE.Face3(15, 13, 5),
      new THREE.Face3(15, 5, 6),

      // top sides horizontal
      new THREE.Face3(22, 6, 7),
      new THREE.Face3(22, 23, 6),

      new THREE.Face3(2, 21, 3),
      new THREE.Face3(21, 20, 3),

      new THREE.Face3(20, 22, 10),
      new THREE.Face3(10, 22, 11),

      new THREE.Face3(23, 21, 14),
      new THREE.Face3(23, 14, 15),

      // top corners
      new THREE.Face3(23, 15, 6),
      new THREE.Face3(3, 20, 10),
      new THREE.Face3(21, 2, 14),
      new THREE.Face3(11, 22, 7),

      // bottom sides horizontal
      new THREE.Face3(18, 4, 5),
      new THREE.Face3(19, 18, 5),

      new THREE.Face3(0, 16, 1),
      new THREE.Face3(16, 17, 1),

      new THREE.Face3(18, 8, 9),
      new THREE.Face3(18, 16, 8),

      new THREE.Face3(12, 17, 13),
      new THREE.Face3(17, 19, 13),

      // // bottom corners
      new THREE.Face3(16, 0, 8),
      new THREE.Face3(1, 17, 12),
      new THREE.Face3(18, 9, 4),
      new THREE.Face3(19, 5, 13),
    );

    geometry.computeVertexNormals(); // compute vertex normals
    geometry.computeFaceNormals(); // compute face normals
    geometry.normalize(); // normalize the geometry

    var materials = [
      new THREE.MeshBasicMaterial({
        color: Utils.lightenColor(this.colors[0], -0.03),
        transparent: true,
        opacity: 1,
      }),
      this._createFace(1),
      this._createFace(2),
      this._createFace(3),
      this._createFace(4),
      this._createFace(5),
      this._createFace(6),
    ];

    geometry.faces[0].materialIndex = 5;
    geometry.faces[1].materialIndex = 5;

    geometry.faces[2].materialIndex = 6;
    geometry.faces[3].materialIndex = 6;

    geometry.faces[4].materialIndex = 2;
    geometry.faces[5].materialIndex = 2;

    geometry.faces[6].materialIndex = 1;
    geometry.faces[7].materialIndex = 1;

    geometry.faces[8].materialIndex = 4;
    geometry.faces[9].materialIndex = 4;

    geometry.faces[10].materialIndex = 3;
    geometry.faces[11].materialIndex = 3;

    geometry.computeBoundingBox();

    var max = geometry.boundingBox.max,
      min = geometry.boundingBox.min;
    var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    var faces = geometry.faces;

    geometry.faceVertexUvs[0] = [];

    for (var i = 0; i < faces.length; i++) {
      const face = faces[i];
      const components = ['x', 'y', 'z',].sort((a,b) =>
        Math.abs(face.normal[a]) - Math.abs(face.normal[b])
      );

      var v1 = geometry.vertices[faces[i].a],
        v2 = geometry.vertices[faces[i].b],
        v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2((v1[components[0]] + offset.x)/range.x ,(v1[components[1]] + offset.y)/range.y),
        new THREE.Vector2((v2[components[0]] + offset.x)/range.x ,(v2[components[1]] + offset.y)/range.y),
        new THREE.Vector2((v3[components[0]] + offset.x)/range.x ,(v3[components[1]] + offset.y)/range.y),
      ]);
    }

    geometry.uvsNeedUpdate = true;

    this.$ = new THREE.Mesh( geometry, materials );
    this.$.name = 'Dice';
    this.$.position.x = 0;
    this.$.position.y = 2;
    this.$.position.z = 0;
    this.$.scale.set(2,2,2);
    this._setOpacity(0);
    this.container.add(this.$);
  }
  _createFace(number) {
    let canvas = Utils.$({element: 'canvas',}),
      ctx = canvas.getContext('2d'),
      width = 64,
      height = 64,
      texture = new THREE.Texture(canvas),
      radius = 5;

    let drawDot = (x, y, r) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
      },
      w4 = width / 4,
      h4 = height / 4,
      h2 = height / 2,
      w2 = width / 2,
      dotPositions = {
        1: [{x: w2, y: h2,},],
        2: [{x:w4, y: h4,}, {x:(w2+w4), y: (h2+h4),},],
        3: [{x:w4, y: h4,}, {x:w2, y: h2,}, {x:(w2+w4), y: (h2+h4),},],
        4: [{x:w4, y: h4,}, {x:(w2+w4), y: (h2+h4),}, {x:(w2+w4), y: h4,}, {x:w4, y: (h2+h4),},],
        5: [{x:w4, y: h4,}, {x:(w2+w4), y: (h2+h4),}, {x: w2, y: h2,}, {x:(w2+w4), y: h4,}, {x:w4, y: (h2+h4),},],
        6: [{x:w4, y: h4,}, {x:w2, y: h4,}, {x:(w2+w4), y: h4,}, {x:w4, y: (h2+h4),}, {x:w2, y: (h2+h4),}, {x:(w2+w4), y: (h2+h4),},],
      };

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = this.colors[0] || '#f6f6f5'; // '#ffbbe4';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = this.colors[1] || "#1e1e1e"; // '#fff'
    let dots = dotPositions[number];
    for(let dotI in dots) {
      let dot = dots[dotI];

      drawDot(dot.x, dot.y, radius);
    }

    texture.needsUpdate = true;

    return new THREE.MeshBasicMaterial({map: texture, transparent: true,});
  }
  _setOpacity(opacity) {
    for(let materialId in this.$.material) {
      let material = this.$.material[materialId];

      material.opacity = opacity;
    }
  }
  setAnimationLength(animationLength) {
    this.animationLength = animationLength;
  }
  roll(number, animationLength) {
    if (!animationLength) return;
    let cube = this.$,
      numberRotations = {
        1: {x: 0, z: .25,},
        2: {x: 0, z: .75,},
        3: {x: 0, z: 0,},
        4: {x: 0, z: .5,},
        5: {x: .75, z: 1,},
        6: {x: .25, z: 1,},
      },
      totalLength = animationLength;

    let baseX = (2*Math.PI) * numberRotations[number].x,
      baseZ = (2*Math.PI) * numberRotations[number].z;

    // Substract animation rotation
    baseX -= (2*Math.PI) * 1.25;
    baseZ -= (2*Math.PI) * .25;

    this.animations.createSequence({name: 'rollDice', steps: [{
      update: (progress) => {
        let diceAlpha = progress * 5;

        this._setOpacity(diceAlpha);

        cube.position.x = 15-10*progress;
        cube.position.y = 15.28 - 13*progress;
        cube.position.z = -(15-10*progress);

        cube.rotation.x = baseX + (2*Math.PI) * progress;
        cube.rotation.z = baseZ + (2*Math.PI) * progress / 4;
      },
      easing: EASING.InQuad,
      length: totalLength * 0.65,
    }, {
      update: (progress) => {
        cube.position.x = 5 * (1-progress);
        cube.position.y = 2.48 + 2 * EASING.Sin(progress/2);
        cube.position.z = -5 * (1-progress);

        cube.rotation.x = baseX + (2*Math.PI) * progress / 4;
      },
      length: totalLength * 0.35,
    },
    ],});
  }
  hide() {
    return this.animations.create({
      update: (progress) => {
        this._setOpacity(1-progress);
      },
      length: 200,
    })
  }
  remove() {
    this.hide().then(() => {
      this.container.remove(this.$);
    });
  }
}