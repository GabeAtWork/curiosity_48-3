import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor({game, x, y, asset, startRecording, bounds, initialVelocity}) {
    super(game, x, y, asset);

    this.props = {
      bounds,
      initialVelocity,
    };
    this.scale.setTo(0.5, 1);
    this.inputEnabled = true;
    this.events.onInputDown.add(() => {
      startRecording(this);
    });
  }

  update() {
    this.updateMovementByBound('x');
    this.updateMovementByBound('y');
  }

  updateMovementByBound(directionName) {
    if (this[directionName] > this.props.bounds[directionName].max) {
      if (this.body.velocity[directionName] > -this.props.initialVelocity[directionName]) {
        this.body.velocity[directionName] -= 5;
      }
    } else if (this[directionName] < this.props.bounds[directionName].min) {
      if (this.body.velocity[directionName] < this.props.initialVelocity[directionName]) {
        this.body.velocity[directionName] += 5;
      }
    }
  }
}
