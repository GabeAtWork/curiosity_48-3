import Level, {GAME_STATE_PLAYING} from './Level';
import UniqueAxisPlatform from '../sprites/UniqueAxisPlatform';

const uniqueAxisPlatformsSource = [
  {
    x: 50,
    y: 10,
    bounds: {
      x: {
        min: 50,
        max: 400,
      },
      y: {
        min: 10,
        max: 10,
      }
    },
    initialVelocity: {
      x: 250,
      y: 0,
    },
    normalAsset: 'orb-2',
    activeAsset: 'orb-2-active'
  },
  {
    x: 400,
    y: 130,
    bounds: {
      x: {
        min: 400,
        max: 400
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
    scale: 1,
    normalAsset: 'orb-3',
    activeAsset: 'orb-3-active'
  },
  {
    x: 560,
    y: 130,
    bounds: {
      x: {
        min: 560,
        max: 560
      },
      y: {
        min: 0,
        max: 260,
      }
    },
    initialVelocity: {
      x: 0,
      y: -250,
    },
    scale: 1,
    normalAsset: 'orb-1',
    activeAsset: 'orb-1-active'
  }
];

export default class extends Level {
  init() {
    this.stage.backgroundColor = '#86c1a6';
  }

  preload() {
    super.preload();
    this.load.image('decoration', 'assets/images/levels/two/level02_foliage.png');
    this.load.image('ground1', 'assets/images/levels/two/level02_ground_01.png');
    this.load.image('ground2', 'assets/images/levels/two/level02_ground_02.png');
    this.load.image('ground3', 'assets/images/levels/two/level02_ground_03.png');
    this.load.image('ground4', 'assets/images/levels/two/level02_ground_04.png');
    this.load.image('ground5', 'assets/images/levels/two/level02_ground_05.png');
  }

  create() {
    this.levelReference = 'Level2';
    this.nextLevelReference = 'Game';
    this.bannerText = 'Level 2';
    this.nextLevelText = 'Back to menu';

    super.create(() => {
      this.backgroundTower = this.add.sprite(0, this.world.height - 140, 'background-tower');
      this.backgroundTower.scale.setTo(1.5, 1.5);
      this.backgroundTower.anchor.setTo(0.5, 0.5);
      this.backgroundTower.alpha = 0.7;
    });

    const killers = this.spawnKillerGroup();
    const envGroup = this.add.group();
    const groundGroup = this.createPhysicsGroup();
    const ground1 = this.createGround(groundGroup, 0, this.world.height - 64, 'ground1');
    const ground2 = this.createGround(groundGroup, 201, 0, 'ground2');
    const ground3 = this.createGround(groundGroup, 332, this.world.height - 224, 'ground3');
    const ground4 = this.createGround(groundGroup, this.world.width - 247, this.world.height - 32, 'ground4');
    const ground5 = this.createGround(groundGroup, this.world.width - 185, this.world.height - 190, 'ground5');
    envGroup.create(0, 0, 'decoration');

    const spike1 = this.add.tileSprite(340, this.world.height - 240, 48, 32, 'spikes');
    killers.add(spike1);
    spike1.body.immovable = true;
    const spike2 = this.add.tileSprite(this.world.width - 247, this.world.height - 48, 247, 32, 'spikes');
    killers.add(spike2);
    spike2.body.immovable = true;

    const laserGroup = this.add.group();
    const winPortal = this.spawnWinPortal(this.world.width - 80, this.world.height - 190 - 24);
    const platformGroup = this.createPhysicsGroup();
    uniqueAxisPlatformsSource.forEach(platformData => {
      this.spawnCapturable(Object.assign({}, platformData, {
        onHoverIn: target => this.onCapturableHoverIn(target),
        onHoverOut: target => this.onCapturableHoverOut(target),
      }), platformGroup, UniqueAxisPlatform);
    });
    const player = this.createPlayer(32, this.world.height - 150);

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
