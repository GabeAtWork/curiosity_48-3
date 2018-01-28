/* globals __DEV__ */
import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {}

  preload() {
    this.load.image('splash-screen', 'assets/images/Splash_screen.jpg');
  }

  create () {
    /*const bannerText = 'CURIOSITY 48-3';
    let banner = this.add.text(this.world.centerX, this.world.centerY, bannerText, {
      font: '80px Yantramanav',
      fill: '#449944',
      smoothed: false
    });
    banner.padding.set(10, 16);
    banner.anchor.setTo(0.5);*/
    const splashScreen = this.add.sprite(0, 0, 'splash-screen');
    this.add.tween(splashScreen).to({y: -(1280 - this.world.height)}, 5000, Phaser.Easing.Quartic.InOut, true);

    setTimeout(() => {
      this.displayStartButton();
    }, 5000);
  }

  displayStartButton() {
    const startButtonText = 'CLICK TO START';
    let startButton = this.add.text(this.world.centerX, this.world.centerY + 20, startButtonText, {
      font: '26px Yantramanav',
      fill: '#E73535',
      fontWeight: 800,
      smoothed: false
    });

    startButton.padding.set(10, 16);
    startButton.anchor.setTo(0.5);
    startButton.inputEnabled = true;
    startButton.alpha = 0;
    startButton.events.onInputDown.add(() => {
      this.state.start('Tutorial', true);
    });
    startButton.setShadow(-1, 1, 'rgba(0,0,0,0.5)', 0);
    startButton.input.useHandCursor = true;

    this.add.tween(startButton).to({alpha: 1}, 1000, Phaser.Easing.Quartic.In, true);

    this.add.tween(startButton).to({alpha: 0.3}, 1000, Phaser.Easing.Linear.None, true);
    let nextAlpha = 1;
    const intervalId = setInterval(() => {
      this.add.tween(startButton).to({alpha: nextAlpha}, 1000, Phaser.Easing.Linear.None, true);
      nextAlpha = nextAlpha === 1 ? 0.3 : 1;
    }, 1000);
  }

  render () {
    if (__DEV__) {
      //this.game.debug.spriteInfo(this.mushroom, 32, 32)
    }
  }
}
