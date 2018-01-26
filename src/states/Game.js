/* globals __DEV__ */
import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    const bannerText = 'Curiosity 48-3';
    let banner = this.add.text(this.world.centerX, 50, bannerText, {
      font: '40px Bangers',
      fill: '#449944',
      smoothed: false
    });

    banner.padding.set(10, 16);
    banner.anchor.setTo(0.5);

    const callToClickText = 'Left-click to start';
    let callToClick = this.add.text(this.world.centerX, this.world.centerY, callToClickText, {
      font: '20px Bangers',
      fill: '#220022',
      smoothed: false
    });

    callToClick.padding.set(10, 16);
    callToClick.anchor.setTo(0.5);
    callToClick.inputEnabled = true;
    callToClick.events.onInputDown.add(() => {
      this.state.start('Level1', true);
    });
  }

  render () {
    if (__DEV__) {
      //this.game.debug.spriteInfo(this.mushroom, 32, 32)
    }
  }
}
