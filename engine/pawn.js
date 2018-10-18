import React from 'react';
import {EASING, TIMES} from "./utils/animations";

export default class Pawn {
  constructor(props) {
    this.x = props.x;
    this.z = props.z;
    this.id = props.id;
    this.color = props.color;
    var geometry = new THREE.ConeGeometry(1.2, 2.8, 8, 1, true, 0, 6.3);
    var material = new THREE.MeshPhongMaterial({
      color: this.color,
      flatShading: true,
      specular: 0x000000,
      shininess: 0,
      reflectivity: 0,
      transparent: true,
    });
    this.$ = new THREE.Object3D();
    this.context = props.context;
  
    let pawnMesh = new THREE.Mesh(geometry, material);
    this.parsedX = props.parsedX;
    this.parsedZ = props.parsedZ;
    this.moveTo(props.parsedX, 20, props.parsedZ);
    this.$.name = 'PawnMesh';
    this.$.add(pawnMesh);
    this.pawnMesh = pawnMesh;
    this._createSelectionObject();
  }
  _createSelectionObject() {
    let width = 4, 
      height = 4,
      selectionGeometry = new THREE.PlaneGeometry( width, height, 32 ),
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      texture = new THREE.Texture(canvas),
      selectionMaterial = new THREE.MeshBasicMaterial({
        map: texture, 
        side: THREE.DoubleSide,
        transparent: true,
      });
    
    canvas.width = width * 20;
    canvas.height = height * 20;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.fillStyle = '#fff';
    ctx.font = "50px FontAwesome";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(String.fromCharCode(61703), canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle='rgba(0,0,0,0.7)';
    ctx.strokeText(String.fromCharCode(61703), canvas.width / 2, canvas.height / 2);
    texture.needsUpdate = true;
    
    this.selectionObject = new THREE.Mesh( selectionGeometry, selectionMaterial );
    this.selectionObject.rotation.y = Math.PI / 4;

    this.selectionObject.position.y = 3;
    this.selectionObject.material.opacity = 0;
    
    this.$.add( this.selectionObject );
  }
  moveTo(x, y, z) {
    this.$.position.x = x;
    this.$.position.y = y + .42;
    this.$.position.z = z;
  }
  select() {
    //create enter animation
    //and after: create infinity bouncing animation
    let enterAnimation = this.context.animations.create({
      id: 'pawnAnimation' + this.id,
      length: 500,
      easing: EASING.InCubic,
      update: progress => {
        this.selectionObject.position.y = 3.0 - progress * .6;
        this.selectionObject.material.opacity = Math.min(progress * 3, 1.0);
      },
    }).then(() => {
      this.context.animations.create({
        id: 'pawnAnimation' + this.id,
        length: 1000,
        loop: true,
        easing: EASING.InOutCubic,
        update: progress => {
          let parsedProgress = progress;

          if (progress >= .5) {
            parsedProgress = .5 - (progress - .5);
          }

          this.selectionObject.position.y = 2.4 + parsedProgress * .6;
        },
      })
    });
  }
  unselect() {
    this.context.animations.removeAnimation('pawnAnimation' + this.id);
    this.selectionObject.material.opacity = 0;
  }
}