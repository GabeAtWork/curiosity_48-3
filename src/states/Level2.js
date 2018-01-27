import Level from './Level';

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

    const banner = this.createBanner();
    const platformGroup = this.createPhysicsGroup();
    const groundGroup = this.createPhysicsGroup();
    const ground = this.createGround(groundGroup, 0, this.world.height - 52);
    ground.scale.setTo(3, 2);
    const player = this.createPlayer(32, this.world.height - 150);
    const killers = this.spawnKillerGroup();
    const cursors = this.input.keyboard.createCursorKeys();

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
      recordings: [],
    }
  }
}
