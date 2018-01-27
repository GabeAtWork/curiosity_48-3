import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor({game, x, y, asset, startRecording, bounds, initialVelocity}) {
    super(game, x, y, asset);

    this.props = {
      bounds,
      initialVelocity,
    };
    this.scale.setTo(0.5, 2);
    this.inputEnabled = true;
    this.events.onInputDown.add(() => {
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
}
