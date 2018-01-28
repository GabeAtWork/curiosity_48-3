/* globals __DEV__ */
import Phaser from 'phaser-ce';
import Level, {GAME_STATE_PLAYING} from './Level';

export default class extends Level {
  init() {
  }

  preload(game) {
    super.preload(game);
    this.load.spritesheet('player-before', 'assets/images/curiosity_full.png', 64, 64);
    this.load.spritesheet('player-before-transform', 'assets/images/curiosity_full_transforme.png', 64, 64);
    this.load.image('background-intro', 'assets/images/levels/intro/level_intro_background.png');
    this.load.spritesheet('the-thing', 'assets/images/levels/intro/level_intro_machine.png', 256, 256);
    this.load.spritesheet('curiosity-transform', 'assets/images/curiosity_transforme.png', 32, 32);

    this.load.audio('curiosity-transform', 'assets/sounds/Curiosity_Transforme.wav');
  }

  create() {
    this.levelReference = 'Level1';
    this.nextLevelReference = 'Level2';
    this.bannerText = 'Level 1';
    this.nextLevelText = '> Next level';

    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.backgroundImage = this.add.sprite(0, 0, 'background-intro');

    const envGroup = this.add.group();
    const groundGroup = this.createPhysicsGroup();

    const ground = this.createGround(groundGroup, 0, this.world.height - 105);
    ground.width = this.world.width + 200;
    ground.height = 64;

    const introGhost = this.makePlayerSprite(this.world.width + 32, this.world.height - 137, '');
    const player = this.createPlayer(this.world.width - 32, this.world.height - 145);
    player.alpha = 0;
    this.add.tween(introGhost).to({x: this.world.width - 32}, 2000, Phaser.Easing.Linear.None, true);
    setTimeout(() => {
      this.setProp('frozen', false);
      player.alpha = 1;
      introGhost.alpha = 0;
    }, 2300);

    const theThing = this.add.sprite(300, 50, 'the-thing');

    theThing.animations.add('getLit', [1], 10, true);
    //theThing.animations.play('move');
    theThing.anchor.setTo(0.5, 0.5);
    theThing.scale.setTo(1, 1);

    const cursors = this.input.keyboard.createCursorKeys();

    const curiosityTransformSound = this.add.audio('curiosity-transform');

    this.props = {
      groundGroup,
      player,
      introGhost,
      cursors,
      theThing,
      frozen: true,
      curiosityTransformSound,
      gameState: GAME_STATE_PLAYING,
      recordings: [],
      hoveredCapturables: [],
    }
  }

  playGameLoop() {
    const {player, cursors, groundGroup, frozen, transformGhost} = this.props;
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
    if (player.x < 302) {
      this.props.frozen = true;
      player.body.velocity.x = 0;
      player.body.velocity.y = 0;
      player.animations.stop();
      player.alpha = 0;

      if (!transformGhost) {
        this.props.transformGhost = this.makeTransformGhost();
      }
    }
  }

  makeTransformGhost() {
    const {player, theThing, curiosityTransformSound} = this.props;
    const transformGhost = this.add.sprite(player.x, player.y, 'player-before-transform');

    transformGhost.animations.add('transform-part-1', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 10, false);
    transformGhost.animations.add('transform-part-2', [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34], 10, false);
    transformGhost.animations.play('transform-part-1');
    transformGhost.animations.currentAnim.onComplete.add(() => {
      theThing.animations.play('getLit');
      transformGhost.animations.play('transform-part-2');
      transformGhost.animations.currentAnim.onComplete.add(() => {
        transformGhost.alpha = 0;

        const newForm = this.add.sprite(player.x, player.y, 'curiosity-transform');
        newForm.animations.add('appear', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, false);
        newForm.animations.play('appear');
        newForm.anchor.setTo(0.5, 0.5);
        curiosityTransformSound.play();
        newForm.animations.currentAnim.onComplete.add(() => {
          const newFormHalo = this.add.sprite(player.x, player.y, 'player-halo');
          newFormHalo.animations.add('idle', [0, 1, 2, 3, 4, 5, 6], 10, true);
          newFormHalo.animations.play('idle');
          newFormHalo.anchor.setTo(0.5, 0.5);
          newFormHalo.alpha = 0.5;
          this.add.tween(newFormHalo).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true);

          this.add.tween(this.world).to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true);
          setTimeout(() => {
            this.state.start('Tutorial', true);
          }, 2000);
        });
      });
    });
    transformGhost.anchor.setTo(0.5, 0.5);
    transformGhost.scale.setTo(-1, 1);
    return transformGhost;
  }

  makePlayerSprite(x, y) {
    const player = this.add.sprite(x, y, 'player-before');

    player.animations.add('move', [0, 1, 2, 3], 10, true);
    player.animations.play('move');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(-1, 1);
    return player;
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
