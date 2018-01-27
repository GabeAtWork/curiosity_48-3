/* globals __DEV__ */
import UniqueAxisPlatform from '../sprites/UniqueAxisPlatform';
import Level, {GAME_STATE_PLAYING} from './Level';

const uniqueAxisPlatformsSource = [
  {
    x: 150,
    y: 150,
    bounds: {
      x: {
        min: 150,
        max: 410,
      },
      y: {
        min: 150,
        max: 150,
      }
    },
    initialVelocity: {
      x: 250,
      y: 0,
    },
    normalAsset: 'orb-1',
    activeAsset: 'orb-1-active'
  },
  {
    x: 50,
    y: 0,
    bounds: {
      x: {
        min: 50,
        max: 50
      },
      y: {
        min: 0,
        max: 260,
      }
    },
    initialVelocity: {
      x: 0,
      y: 250,
    },
    scale: 1.5,
    normalAsset: 'orb-2',
    activeAsset: 'orb-2-active'
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
    this.load.image('orb-1', 'assets/images/orbs/Orbe01.png');
    this.load.image('orb-1-active', 'assets/images/orbs/Orbe01_Active.png');
    this.load.image('orb-2', 'assets/images/orbs/Orbe02.png');
    this.load.image('orb-2-active', 'assets/images/orbs/Orbe02_Active.png');
    this.load.image('spikes', 'assets/images/Spikes.png');
  }

  create() {
    this.levelReference = 'Level1';
    this.nextLevelReference = 'Level2';
    this.bannerText = 'Level 1';
    this.nextLevelText = 'Next level';

    super.create();

    const killers = this.spawnKillerGroup();
    const groundGroup = this.createPhysicsGroup();
    const ground1 = this.createGround(groundGroup, 0, this.world.height - 64, 'ground1');
    const ground2 = this.createGround(groundGroup, this.world.width - 192, this.world.height - 128, 'ground2');
    const ground3 = this.createGround(groundGroup, this.world.width - 192 - 195, this.world.height - 32, 'ground3');
    const player = this.createPlayer(32, this.world.height - 150);

    const spikes = this.add.tileSprite(this.world.width - 192 - 195, this.world.height - 50, 195, 32, 'spikes');
    killers.add(spikes);
    spikes.body.immovable = true;

    const laserGroup = this.add.group();
    const platformGroup = this.createPhysicsGroup();
    uniqueAxisPlatformsSource.forEach(platformData => {
      this.spawnCapturable(Object.assign({}, platformData, {
        onHoverIn: target => this.onCapturableHoverIn(target),
        onHoverOut: target => this.onCapturableHoverOut(target),
      }), platformGroup, UniqueAxisPlatform);
    });

    const winPortal = this.spawnWinPortal(this.world.width - 28, this.world.height - 128 - 24);

    const banner = this.createBanner();

    const cursors = this.input.keyboard.createCursorKeys();
    const orbHalo = this.add.sprite(0, 0, 'orb-halo');
    orbHalo.scale.set(1, 1);
    orbHalo.anchor.setTo(0, 0);
    laserGroup.add(orbHalo);

    this.props = {
      banner,
      groundGroup,
      platformGroup,
      player,
      killers,
      laserGroup,
      cursors,
      winPortal,
      orbHalo,
      gameState: GAME_STATE_PLAYING,
      recordings: [],
      hoveredCapturables: [],
    }
  }
}
