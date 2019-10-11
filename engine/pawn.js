import {EASING, } from "./utils/animations";
import GlowShader from './shaders/glow';

const TextureLoader = new THREE.TextureLoader();

export default class Pawn {
  constructor(props) {
    this.scene = props.scene;
    this.camera = props.camera;
    this.x = props.x;
    this.z = props.z;
    this.id = props.id;
    this.color = props.color;
    this.geometry = new THREE.ConeGeometry(1.2, 2.8, 8, 1, true, 0, 6.3);
    var material = new THREE.MeshPhongMaterial({
      color: this.color,
      flatShading: true,
      specular: 0x000000,
      shininess: 0,
      reflectivity: 0,
      transparent: true,
      opacity: 1.0,
    });
    this.$ = new THREE.Object3D();
    this.context = props.context;

    let pawnMesh = new THREE.Mesh(this.geometry, material);
    this.parsedX = props.parsedX;
    this.parsedZ = props.parsedZ;
    this.moveTo(props.parsedX, 20, props.parsedZ);
    this.$.name = 'PawnMesh';
    this.$.add(pawnMesh);
    this.pawnMesh = pawnMesh;
    this.geometry.computeBoundingSphere();
    this.boundingSphere = new THREE.Mesh(
      new THREE.SphereGeometry( this.geometry.boundingSphere.radius, 8, 8 ),
      new THREE.MeshBasicMaterial({
        opacity: 0,
        transparent: true,
        depthTest: false,
      }),
    );
    this.boundingSphere.position.set(
      this.geometry.boundingSphere.center.x,
      this.geometry.boundingSphere.center.y,
      this.geometry.boundingSphere.center.z,
    );
    this.boundingSphere.scale.set(1.5,1.5,1.5);
    this.$.add(this.boundingSphere);
    this.createSelectionObject();
  }
  createSelectionObject() {
    if (this.selectionObject) return;

    let width = 2.1,
      height = 2.1,
      selectionGeometry = new THREE.PlaneGeometry( width, height, 2 ),
      selectionMaterial = new THREE.MeshBasicMaterial({
        map: TextureLoader.load('/static/down-arrow.svg'),
        transparent: true,
        depthTest: true,
        depthWrite: false,
      });

    this.selectionObject = new THREE.Mesh( selectionGeometry, selectionMaterial );
    this.selectionObject.rotation.y = Math.PI / 4;

    this.selectionObject.position.y = 3;
    this.selectionObject.material.opacity = 0;

    this.$.add( this.selectionObject );

    if (this.selected) {
      this.select();
    }
  }
  moveTo(x, y, z) {
    this.$.position.x = x;
    this.$.position.y = y + .42;
    this.$.position.z = z;
  }
  select() {
    if (!this.selectionObject) {
      this.selected = true;
      return;
    }

    if (this.glowMesh) {
      this.$.remove(this.glowMesh);
    }

    const customMaterial = new THREE.ShaderMaterial(
      {
        uniforms:
        {
          i: { type: 'f', value: 0.0, },
          c: { type: 'f', value: 1.0, },
          p: { type: 'f', value: 1.4, },
          glowColor: { type: 'c', value: new THREE.Color(0xffffff), },
          viewVector: { type: 'v3', value: this.camera.position, },
        },
        vertexShader: GlowShader.vertexShader,
        fragmentShader: GlowShader.fragmentShader,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: true,
        depthWrite: false,
      },
    );

    this.glowMesh = new THREE.Mesh(this.pawnMesh.geometry, customMaterial);
    this.glowMesh.scale.multiplyScalar(1.4);
    this.glowMesh.position.y = .42;
    this.glowMesh.renderOrder = 600;
    this.$.add(this.glowMesh);

    //create enter animation
    //and after: create infinity bouncing animation
    this.context.animations.create({
      id: 'pawnAnimation' + this.id,
      length: 500,
      easing: EASING.InOutCubic,
      update: progress => {
        this.selectionObject.position.y = 3.2 - progress * .6;
        this.selectionObject.material.opacity = Math.min(progress * 3, 1.0);
        this.glowMesh.material.uniforms.i.value = Math.min(progress * 3, 1.0);
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
          this.selectionObject.position.y = 2.6 + parsedProgress * .6;
          this.glowMesh.material.uniforms.i.value = 0.85 + parseInt(parsedProgress * 100) / 100;
        },
      })
    });
  }
  unselect() {
    this.$.remove(this.glowMesh);
    this.glowMesh = null;

    this.context.animations.removeAnimation('pawnAnimation' + this.id);
    if (this.selectionObject) {
      this.selectionObject.material.opacity = 0;
    }
  }
}