/* globals __DEV__ */
import Phaser from 'phaser-ce';
import Level, {GAME_STATE_PLAYING} from './Level';

export default class extends Level {
  init() {
  }

  preload(game) {
    super.preload(game);
    this.load.spritesheet('player-before', 'assets/images/curiosity_full.png', 64, 64);
    this.load.image('background-intro', 'assets/images/levels/intro/level_intro_background.png');
    this.load.spritesheet('the-thing', 'assets/images/levels/intro/level_intro_machine.png', 256, 256);
  }

  create() {
    this.levelReference = 'Level1';
    this.nextLevelReference = 'Level2';
    this.bannerText = 'Level 1';
    this.nextLevelText = 'Next level';

    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.backgroundImage = this.add.sprite(0, 0, 'background-intro');

    const envGroup = this.add.group();
    const groundGroup = this.createPhysicsGroup();

    const ground = this.createGround(groundGroup, 0, this.world.height - 105);
    ground.width = this.world.width + 200;
    ground.height = 64;

    const introGhost = this.makePlayerSprite(this.world.width + 32, this.world.height - 137);
    const player = this.createPlayer(this.world.width - 32, this.world.height - 145);
    player.alpha = 0;
    this.add.tween(introGhost).to({x: this.world.width - 32}, 2000, Phaser.Easing.Linear.None, true);
    setTimeout(() => {
      this.setProp('frozen', false);
      player.alpha = 1;
      introGhost.alpha = 0;
    }, 2300);

    const cursors = this.input.keyboard.createCursorKeys();

    this.props = {
      groundGroup,
      player,
      cursors,
      frozen: true,
      gameState: GAME_STATE_PLAYING,
      recordings: [],
      hoveredCapturables: [],
    }
  }

  playGameLoop() {
    const {player, cursors, groundGroup, frozen} = this.props;
    this.physics.arcade.collide(player, groundGroup);

    if (!frozen) {
      // Ralentissement
      if (player.body.velocity.x > 10) {
        player.body.velocity.x -= 10;
      } else if (player.body.velocity.x >= -10) {
        player.body.velocity.x = 0;
      } else {
        player.body.velocity.x += 10;
      }

      if (cursors.left.isDown) {
        player.body.velocity.x = -player.customSpeed;
      }
      else if (cursors.right.isDown) {
        player.body.velocity.x = player.customSpeed;
      }
      else {
        //player.animations.stop();
      }
    }
  }

  makePlayerSprite(x, y) {
    const player = this.add.sprite(x, y, 'player-before');

    player.animations.add('move', [0, 1, 2, 3], 10, true);
    player.animations.play('move');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(-1, 1);
    return player
  }

  createPlayer(x, y) {
    const player = this.makePlayerSprite(x, y);
    this.physics.arcade.enable(player);

    player.body.bounce.y = 0.5;
    player.body.gravity.y = 500;
    player.body.collideWorldBounds = true;
    player.customSpeed = 80;
    return player;
  }
}
