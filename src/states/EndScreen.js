/* globals __DEV__ */
import Phaser from 'phaser'

export default class extends Phaser.State {
  init() {
  }

  preload() {
    this.load.image('exit-screen', 'assets/images/Credits_background.png');
    this.load.spritesheet('exit-screen-effect', 'assets/images/credits_screen.png', 640, 360);
  }

  create() {
    /*const bannerText = 'CURIOSITY 48-3';
    let banner = this.add.text(this.world.centerX, this.world.centerY, bannerText, {
      font: '80px Yantramanav',
      fill: '#449944',
      smoothed: false
    });
    banner.padding.set(10, 16);
    banner.anchor.setTo(0.5);*/
    const splashScreen = this.add.sprite(0, 0, 'exit-screen');
    const splashScreenEffect = this.add.sprite(0, 0, 'exit-screen-effect');
    splashScreenEffect.animations.add('idle', [0, 2, 3, 4, 5, 6, 7, 8], 10, true);
    splashScreenEffect.animations.play('idle');

    this.creditsContent = [
      ' ',
      'Project Curiosity',
      'v48.3',
      ' ',
      'Target has been located',
      ' ',
      'A message has been sent to the following team members:',
      '- Thibault Barbaroux, Graphic designer',
      '- Gabriel Theron, Developer',
      '    ',
      '...',
      '    ',
      '"It is awake."',
    ];

    this.textDisplay = this.add.text(40, 32, '', {
      font: '20px VT323',
      fill: '#ddebe1',
    });
    this.charIndex = 0;
    this.textLine = '';
    this.nextLine();

    setTimeout(() => {
      this.displayStartButton();
    }, 10000);
  }

  displayStartButton() {
    const startButtonText = 'Go Back';
    let startButton = this.add.text(this.world.width - 30, this.world.height - 16, startButtonText, {
      font: '14px Yantramanav',
      fill: '#30BDE8',
      fontWeight: 800,
      smoothed: false
    });

    startButton.padding.set(10, 16);
    startButton.anchor.setTo(1);
    startButton.inputEnabled = true;
    startButton.alpha = 0;
    startButton.events.onInputDown.add(() => {
      this.state.start('Game', true);
    });
    startButton.setShadow(-1, 1, 'rgba(0,0,0,0.5)', 0);
    startButton.input.useHandCursor = true;

    this.add.tween(startButton).to({alpha: 1}, 1000, Phaser.Easing.Quartic.In, true);
  }

  updateLine() {
    if (this.textLine.length < this.creditsContent[this.charIndex].length) {
      this.textLine = this.creditsContent[this.charIndex].substr(0, this.textLine.length + 1);
      // text.text = line;
      this.textDisplay.setText(this.textLine);
    }
    else {
      //  Wait 2 seconds then start a new line
      this.time.events.add(Phaser.Timer.SECOND * 1, () => this.nextLine(), this);
    }
  }

  nextLine() {
    this.charIndex++;

    const newX = this.textDisplay.x;
    const newY = this.textDisplay.y + 20;
    this.textDisplay = this.add.text(newX, newY, '', {
      font: '20px VT323',
      fill: '#ddebe1',
    });

    if (this.charIndex < this.creditsContent.length) {
      this.textLine = '';
      this.time.events.repeat(80, this.creditsContent[this.charIndex].length + 1, () => this.updateLine(), this);
    }
  }
}
