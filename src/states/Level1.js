import Phaser from 'phaser'
import Capturable from '../sprites/Capturable';

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#86c1a6';
  }

  setProp(name, value) {
    this.props[name] = value;
  }

  preload() {
    this.load.image('ground', 'assets/images/loader-bg.png');
  }

  create() {
    this.physics.startSystem(Phaser.Physics.ARCADE);

    const banner = this.createBanner();
    const platformGroup = this.createPlatformsGroup();
    const ground = this.createGround(platformGroup);
    const player = this.createPlayer();
    const capturablesSource = [
      {
        x: 200,
        y: 300,
        bounds: {
          x: {
            min: 300,
            max: 400
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
    capturablesSource.forEach(capturableData => {
      this.spawnCapturable(capturableData, platformGroup);
    });

    const cursors = this.input.keyboard.createCursorKeys();

    this.props = {
      banner,
      platformGroup,
      ground,
      player,
      cursors,
      velocityHistory: [],
      recordedObject: null,
      recordVelocityHistory: false,
      playVelocityHistory: false,
    }
  }

  update() {
    const {player, platformGroup, cursors, velocityHistory, recordedObject, recordVelocityHistory, playVelocityHistory} = this.props;
    const hitPlatform = this.physics.arcade.collide(player, platformGroup);

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
      player.body.velocity.x = -50;
      player.animations.play('left');
    }
    else if (cursors.right.isDown) {
      player.body.velocity.x = 50;
      player.animations.play('right');
    }
    else {
      player.animations.stop();
      player.frame = 4;
    }

    // Jump
    if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
      player.body.velocity.y = -300;
    }

    // Checking for the hold
    if (recordVelocityHistory && recordedObject) {
      velocityHistory.push(recordedObject.body.velocity);
    } else if (playVelocityHistory) {
      if (velocityHistory.length) {
        const newVelocity = velocityHistory.shift();
        player.body.velocity.x = newVelocity.x;
        player.body.velocity.y = newVelocity.y;
      } else {
        this.props.playVelocityHistory = false;
        this.props.velocityHistory = [];
      }
    }

    if (this.input.activePointer.isUp && recordVelocityHistory) {
      this.props.recordVelocityHistory = false;
      this.props.playVelocityHistory = true;
    }
  }

  createBanner() {
    const bannerText = 'Level 1';
    const hiddenY = -50;
    const displayedY = 50;

    let banner = this.add.text(this.world.centerX, hiddenY, bannerText, {
      font: '40px Bangers',
      fill: '#449944',
      smoothed: false
    });

    banner.padding.set(10, 16);
    banner.anchor.setTo(0.5);

    this.add.tween(banner).to({y: displayedY}, 500, Phaser.Easing.Quartic.Out, true);
    setTimeout(() => {
      this.add.tween(banner).to({y: hiddenY}, 500, Phaser.Easing.Quartic.In, true);
      this.add.tween(banner).to({alpha: 0}, 500, 'Linear', true);
    }, 2000);

    return banner;
  }

  createPlatformsGroup() {
    const platformGroup = this.add.group();
    platformGroup.enableBody = true;
    return platformGroup;
  }

  createGround(platformGroup) {
    const ground = platformGroup.create(0, this.world.height - 52, 'ground');
    ground.scale.setTo(3, 2);
    ground.body.immovable = true;

    return ground;
  }

  createPlayer() {
    const player = this.add.sprite(32, this.world.height - 150, 'dude');

    this.physics.arcade.enable(player);

    player.body.bounce.y = 0.5;
    player.body.gravity.y = 500;
    player.body.collideWorldBounds = true;
    return player;
  }

  spawnCapturable(capturableData, platformGroup) {
    const {x, y, asset = 'ground', bounds, initialVelocity} = capturableData;

    const capturable = new Capturable({
      game: this.game,
      x,
      y,
      asset,
      level: this,
      bounds,
      initialVelocity,
    });
    platformGroup.add(capturable);
    capturable.body.velocity.x = initialVelocity.x;
    capturable.body.velocity.y = initialVelocity.y;
    capturable.body.immovable = true;

    return capturable
  }
}
