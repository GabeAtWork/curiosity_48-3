import Phaser from 'phaser'

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#86c1a6';
  }

  preload() {
    //
    // load your assets
    //
  }

  create() {
    const bannerText = 'Level 1';
    let banner = this.add.text(this.world.centerX, 50, bannerText, {
      font: '40px Bangers',
      fill: '#449944',
      smoothed: false
    });

    banner.padding.set(10, 16);
    banner.anchor.setTo(0.5);
  }
}
