/* globals __DEV__ */
import UniqueAxisPlatform from '../sprites/UniqueAxisPlatform';
import Level, {GAME_STATE_PLAYING} from './Level';

const uniqueAxisPlatformsSource = [
  {
    x: 200,
    y: 300,
    bounds: {
      x: {
        min: 150,
        max: 500
      },
      y: {
        min: 300,
        max: 400,
      }
    },
    initialVelocity: {
      x: 250,
      y: 0,
    }
  },
  {
    x: 50,
    y: 100,
    bounds: {
      x: {
        min: 50,
        max: 50
      },
      y: {
        min: 50,
        max: 350,
      }
    },
    initialVelocity: {
      x: 0,
      y: 250,
    }
  }
];

export default class extends Level {
  init() {
  }

  preload(game) {
    super.preload(game);
    this.load.image('ground', 'assets/images/loader-bg.png');
    this.load.image('loaderBar', 'assets/images/loader-bar.png');
    this.load.image('ground1', 'assets/images/levels/one/Level_01_Ground_01.png');
    this.load.image('ground2', 'assets/images/levels/one/Level_01_Ground_02.png');
    this.load.image('ground3', 'assets/images/levels/one/Level_01_Ground_03.png');
    this.load.image('spikes', 'assets/images/Spikes.png');
  }

  create() {
    this.levelReference = 'Level1';
    this.nextLevelReference = 'Level2';
    this.bannerText = 'Level 1';
    this.nextLevelText = 'Next level';

    super.create();

    const banner = this.createBanner();
    const platformGroup = this.createPhysicsGroup();
    const killers = this.spawnKillerGroup();

    const groundGroup = this.createPhysicsGroup();
    const ground1 = this.createGround(groundGroup, 0, this.world.height - 64, 'ground1');
    const ground2 = this.createGround(groundGroup, this.world.width - 192, this.world.height - 128, 'ground2');
    const ground3 = this.createGround(groundGroup, this.world.width - 192 - 195, this.world.height - 32, 'ground3');
    const player = this.createPlayer(32, this.world.height - 150);

    const spikes = this.add.tileSprite(this.world.width - 192 - 195, this.world.height - 50, 195, 32, 'spikes');
    killers.add(spikes);
    spikes.body.immovable = true;

    const cursors = this.input.keyboard.createCursorKeys();
    uniqueAxisPlatformsSource.forEach(platformData => {
      this.spawnCapturable(platformData, platformGroup, UniqueAxisPlatform);
    });

    const winPortal = this.spawnWinPortal(this.world.width - 28, this.world.height - 128 - 24);

    this.props = {
      banner,
      groundGroup,
      platformGroup,
      player,
      killers,
      cursors,
      winPortal,
      gameState: GAME_STATE_PLAYING,
      recordings: [],
    }
  }
}
