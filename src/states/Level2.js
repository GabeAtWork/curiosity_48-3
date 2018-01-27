import Level, {GAME_STATE_PLAYING} from './Level';

export default class extends Level {
  init() {
    this.stage.backgroundColor = '#86c1a6';
  }

  preload() {
    this.load.image('ground', 'assets/images/loader-bg.png');
    this.load.image('loaderBar', 'assets/images/loader-bar.png');
  }

  create() {
    this.levelReference = 'Level2';
    this.nextLevelReference = 'Game';
    this.bannerText = 'Level 2';
    this.nextLevelText = 'Back to menu';

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
