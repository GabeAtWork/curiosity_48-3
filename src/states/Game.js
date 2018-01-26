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

    /*this.mushroom = new Mushroom({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'mushroom'
    })

    this.game.add.existing(this.mushroom)*/
  }

  render () {
    if (__DEV__) {
      //this.game.debug.spriteInfo(this.mushroom, 32, 32)
    }
  }
}
