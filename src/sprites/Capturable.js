import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor(initData) {
    const {game, x, y, startRecording, bounds, initialVelocity, normalAsset, activeAsset, scale = 1, onHoverIn, onHoverOut} = initData;
    super(game, x, y, normalAsset);

    this.props = {
      bounds,
      initialVelocity,
      normalAsset,
      activeAsset,
      hovered: false,
      onHoverIn,
      onHoverOut,
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


    if (this.props.hovered && !this.input.pointerOver()) {
      this.props.onHoverOut(this);
      this.props.hovered = false;
    } else if (!this.props.hovered && this.input.pointerOver()) {
      this.props.hovered = true;
      this.props.onHoverIn(this);
    }
  }

  updateMovementByAxis() {
    throw new Error('This is an abstract class');
  }

  setInactive() {
    this.loadTexture(this.props.normalAsset);
  }
}
