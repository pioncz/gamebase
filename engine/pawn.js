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
    this.rotationY = 0;
    this.color = new THREE.Color(props.color);
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
    this.customMaterial = new THREE.ShaderMaterial(
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
    this.$ = new THREE.Object3D();
    this.context = props.context;
    this.selected = false;

    let pawnMesh = new THREE.Mesh(this.geometry, material);
    this.parsedX = props.parsedX;
    this.parsedZ = props.parsedZ;
    this.moveTo(props.parsedX, 20, props.parsedZ);
    this.$.name = 'PawnMesh';
    this.$.add(pawnMesh);
    this.pawnMesh = pawnMesh;
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
    this.$.position.y = y + .62;
    this.$.position.z = z;
  }
  select(orientation) {
    this.selected = true;

    if (!this.selectionObject) {
      return;
    }

    if (this.glowMesh) {
      this.$.remove(this.glowMesh);
    }

    this.glowMesh = new THREE.Mesh(this.pawnMesh.geometry, this.customMaterial);
    this.glowMesh.scale.multiplyScalar(1.4);
    this.glowMesh.position.y = .42;
    this.rotate(orientation);

    this.glowMesh.renderOrder = 600;
    this.$.add(this.glowMesh);
    this.customMaterial.uniforms.i.value = 0;
    //create enter animation
    //and after: create infinity bouncing animation
    this.context.animations.create({
      id: 'pawnAnimation' + this.id,
      length: 500,
      easing: EASING.InOutCubic,
      update: progress => {
        this.selectionObject.position.y = 3.2 - progress * .6;
        this.selectionObject.material.opacity = Math.min(progress * 3, 1.0);
        this.glowMesh.material.uniforms.i.value = progress * 0.85;
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
    this.selected = false;
    this.$.remove(this.glowMesh);
    this.glowMesh = null;

    this.context.animations.removeAnimation('pawnAnimation' + this.id);
    if (this.selectionObject) {
      this.selectionObject.material.opacity = 0;
    }
  }
  darken() {
    if (this.context.animations._getAnimationById(`pawn ${this.id} darken`)) {
      return;
    }

    const colorHSL = this.color.getHSL(new THREE.Color());

    this.context.animations.create({
      id: `pawn ${this.id} darken`,
      length: 200,
      easing: EASING.InOutCubic,
      update: progress => {
        const light = colorHSL.l - 0.2 * progress;

        this.pawnMesh.material.color.setHSL(colorHSL.h, colorHSL.s, light);
      },
    });
  }
  lighten() {
    if (this.context.animations._getAnimationById(`pawn ${this.id} lighten`)) {
      return;
    }

    const colorHSL = this.color.getHSL(new THREE.Color());

    this.context.animations.create({
      id: `pawn ${this.id} lighten`,
      length: 200,
      easing: EASING.InOutCubic,
      update: progress => {
        const light = colorHSL.l + 0.2 * progress;

        this.pawnMesh.material.color.setHSL(colorHSL.h, colorHSL.s, light);
      },
    });
  }
  normalizeColor() {
    if (this.context.animations._getAnimationById(`pawn ${this.id} lighten`)) {
      return;
    }

    const colorHSL = this.color.getHSL(new THREE.Color());
    const materialHSL = this.pawnMesh.material.color.getHSL(new THREE.Color());
    this.context.animations.create({
      id: `pawn ${this.id} normalize`,
      length: 200,
      easing: EASING.InOutCubic,
      update: progress => {
        const light = materialHSL.l * (1 - progress) + colorHSL.l * progress;
        this.pawnMesh.material.color.setHSL(colorHSL.h, colorHSL.s, light);
      },
    });
  }
  rotate(orientation) {
    const { portrait, rotationY,} = orientation;

    if (this.glowMesh) {
      this.glowMesh.rotation.y = -rotationY;
    }

    if (this.selectionObject) {
      if (portrait) {
        this.selectionObject.rotation.y = -rotationY + Math.PI / 4;
      } else {
        this.selectionObject.rotation.y = -rotationY + Math.PI / 4;
      }
    }
  }
}