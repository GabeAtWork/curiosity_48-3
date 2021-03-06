import 'pixi';
import 'p2';
import Phaser from 'phaser';
import config from './config';
import BootState from './states/Boot';
import SplashState from './states/Splash';
import GameState from './states/Game';
import Intro from './states/Intro';
import Tutorial from './states/Tutorial';
import Level1 from './states/Level1';
import Level2 from './states/Level2';
import Level3 from './states/Level3';
import EndScreen from './states/EndScreen';

class Game extends Phaser.Game {
  constructor () {
    const docElement = document.documentElement;
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth;
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight;

    super(width, height, Phaser.CANVAS, 'content', null);

    this.state.add('Boot', BootState, false);
    this.state.add('Splash', SplashState, false);
    this.state.add('Game', GameState, false);
    this.state.add('Intro', Intro, false);
    this.state.add('Tutorial', Tutorial, false);
    this.state.add('Level1', Level1, false);
    this.state.add('Level2', Level2, false);
    this.state.add('Level3', Level3, false);
    this.state.add('EndScreen', EndScreen, false);

    // with Cordova with need to wait that the device is ready so we will call the Boot state in another file
    if (!window.cordova) {
      this.state.start('Boot')
    }
  }
}

window.game = new Game();

if (window.cordova) {
  var app = {
    initialize: function () {
      document.addEventListener(
        'deviceready',
        this.onDeviceReady.bind(this),
        false
      )
    },

    // deviceready Event Handler
    //
    onDeviceReady: function () {
      this.receivedEvent('deviceready')

      // When the device is ready, start Phaser Boot state.
      window.game.state.start('Boot')
    },

    receivedEvent: function (id) {
      console.log('Received Event: ' + id)
    }
  }

  app.initialize()
}
