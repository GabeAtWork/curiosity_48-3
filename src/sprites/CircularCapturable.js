import Capturable from './Capturable';

export default class extends Capturable {
  constructor(properties) {
    super(properties);
  }

  update() {
    this.updateMovementByAxis('x');
    this.updateMovementByAxis('y');
  }

  updateMovementByAxis(directionName) {

  }
}
