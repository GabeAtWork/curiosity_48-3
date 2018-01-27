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

  updateMovementByAxis(directionName) {
    const currentPosition = this[directionName];
    const currentVelocity = this.body.velocity[directionName];
    const maxBound = this.props.bounds[directionName].max;
    const minBound = this.props.bounds[directionName].min;
    const initialVelocity = this.props.initialVelocity[directionName];
    const minVelocity = 50;
    const directionChangeAdjustement = initialVelocity - minVelocity;
    const slowDownEasingStep = 10;
    const slowDownEasingLimitModifier = 50;
    const accelerateEasingStep = 10;
    const accelerateEasingLimitModifier = 50;

    if (currentPosition > maxBound) {
      // Changement de direction
      this.body.velocity[directionName] = -initialVelocity + directionChangeAdjustement;
    } else if (currentPosition < minBound) {
      // Changement de direction
      this.body.velocity[directionName] = initialVelocity - directionChangeAdjustement;
    } else if (
      currentPosition > maxBound - slowDownEasingLimitModifier
      && currentVelocity > minVelocity
    ) {
      // Ralentissement avant fin
      this.body.velocity[directionName] -= slowDownEasingStep;
    } else if (
      currentPosition < minBound + slowDownEasingLimitModifier
      && currentVelocity < -minVelocity
    ) {
      // Ralentissement avant fin
      this.body.velocity[directionName] += slowDownEasingStep;
    } else if (
      currentPosition < minBound + accelerateEasingLimitModifier
      && currentVelocity < initialVelocity
    ) {
      this.body.velocity[directionName] += accelerateEasingStep;
    } else if (
      currentPosition > maxBound - accelerateEasingLimitModifier
      && currentVelocity > -initialVelocity
    ) {
      this.body.velocity[directionName] -= accelerateEasingStep;
    }
  }
}
