/* globals __DEV__ */
import UniqueAxisPlatform from '../sprites/UniqueAxisPlatform';
import Level, {GAME_STATE_PLAYING} from './Level';

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
    normalAsset: 'orb-3',
    activeAsset: 'orb-3-active'
  }
];

export default class extends Level {
  init() {
  }

  preload(game) {
    super.preload(game);
    this.load.image('ground', 'assets/images/loader-bg.png');
    this.load.image('loaderBar', 'assets/images/loader-bar.png');
    this.load.image('ground1', 'assets/images/levels/tutorial/level_tuto_01_ground_01.png');
    this.load.image('ground2', 'assets/images/levels/tutorial/level_tuto_01_ground_02.png');
    this.load.image('decoration', 'assets/images/levels/tutorial/level_tuto_01_foliage.png');
  }

  create() {
    this.levelReference = 'Level0';
    this.nextLevelReference = 'Level1';
    this.bannerText = 'Tutorial';
    this.nextLevelText = 'Next level';

    super.create(() => {
      this.backgroundTower = this.add.sprite(this.world.width - 50, this.world.height - 150, 'background-tower');
      this.backgroundTower.scale.setTo(3, 3);
      this.backgroundTower.anchor.setTo(0.5, 0.5);
      this.backgroundTower.alpha = 1;
    });

    const killers = this.spawnKillerGroup();
    const envGroup = this.add.group();
    const groundGroup = this.createPhysicsGroup();

    const ground1 = this.createGround(groundGroup, 0, this.world.height - 224, 'ground1');
    const ground2 = this.createGround(groundGroup, this.world.width - 384, this.world.height - 64, 'ground2');

    envGroup.create(0, 0, 'decoration');

    const laserGroup = this.add.group();
    const platformGroup = this.createPhysicsGroup();
    uniqueAxisPlatformsSource.forEach(platformData => {
      this.spawnCapturable(Object.assign({}, platformData, {
        onHoverIn: target => this.onCapturableHoverIn(target),
        onHoverOut: target => this.onCapturableHoverOut(target),
      }), platformGroup, UniqueAxisPlatform);
    });
    const player = this.createPlayer(32, this.world.height - 242);
    const playerHalo = this.createPlayerHalo(player);

    const winPortal = this.spawnWinPortal(300, this.world.height - 64 - 24);

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
      playerHalo,
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
