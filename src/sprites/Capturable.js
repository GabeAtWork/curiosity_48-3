import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor(initData) {
    const {game, x, y, startRecording, bounds, initialVelocity, normalAsset, activeAsset, scale = 1} = initData;
    super(game, x, y, normalAsset);

    this.props = {
      bounds,
      initialVelocity,
      normalAsset,
      activeAsset,
    };
    this.scale.setTo(scale, scale);
    this.inputEnabled = true;
    this.events.onInputDown.add(() => {
      this.loadTexture(activeAsset);
      startRecording(this);
    });
  }

  update() {
    this.updateMovementByAxis('x');
    this.updateMovementByAxis('y');
  }

  updateMovementByAxis() {
    throw new Error('This is an abstract class');
  }

  setInactive() {
    this.loadTexture(this.props.normalAsset);
  }
}
