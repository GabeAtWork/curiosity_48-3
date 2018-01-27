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
    this.stage.backgroundColor = '#86c1a6';
  }

  preload(game) {
    super.preload(game);
    this.load.image('ground', 'assets/images/loader-bg.png');
    this.load.image('loaderBar', 'assets/images/loader-bar.png');
  }

  create() {
    this.levelReference = 'Level1';
    this.nextLevelReference = 'Level2';
    this.bannerText = 'Level 1';
    this.nextLevelText = 'Next level';

    super.create();

    const banner = this.createBanner();
    const platformGroup = this.createPhysicsGroup();
    const groundGroup = this.createPhysicsGroup();
    const ground = this.createGround(groundGroup, 0, this.world.height - 52);
    ground.scale.setTo(3, 2);
    const player = this.createPlayer(32, this.world.height - 150);
    const killers = this.spawnKillerGroup();

    const spikes = killers.create(300, this.world.height - 72, 'loaderBar');
    spikes.body.immovable = true;

    const cursors = this.input.keyboard.createCursorKeys();
    uniqueAxisPlatformsSource.forEach(platformData => {
      this.spawnCapturable(platformData, platformGroup, UniqueAxisPlatform);
    });

    const winPortal = this.spawnWinPortal(this.world.width - 50, this.world.height - 85);

    this.props = {
      banner,
      groundGroup,
      platformGroup,
      ground,
      player,
      killers,
      cursors,
      winPortal,
      gameState: GAME_STATE_PLAYING,
      recordings: [],
    }
  }
}
