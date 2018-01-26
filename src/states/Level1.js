import Phaser from 'phaser'

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#86c1a6';
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
    const velocityTestObject = platformGroup.create(250, 300, 'ground');
    velocityTestObject.scale.setTo(0.5, 1);
    velocityTestObject.body.velocity.x = 250;
    velocityTestObject.inputEnabled = true;
    velocityTestObject.events.onInputDown.add(() => {
      this.props.recordVelocityHistory = true;
      this.props.recordedObject = velocityTestObject;
    });

    const cursors = this.input.keyboard.createCursorKeys();

    this.props = {
      banner,
      platformGroup,
      ground,
      player,
      cursors,
      velocityTestObject,
      velocityHistory: [],
      recordedObject: null,
      recordVelocityHistory: false,
      playVelocityHistory: false,
    }
  }

  update() {
    const {player, platformGroup, cursors, velocityTestObject, velocityHistory, recordedObject, recordVelocityHistory, playVelocityHistory} = this.props;
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

    // Platform movement
    if (velocityTestObject.x > 400) {
      if (velocityTestObject.body.velocity.x > -250) {
        velocityTestObject.body.velocity.x -= 5;
      }
    } else if (velocityTestObject.x < 300) {
      if (velocityTestObject.body.velocity.x < 250) {
        velocityTestObject.body.velocity.x += 5;
      }
    }

    // Checking for the hold
    if (recordVelocityHistory && recordedObject) {
      velocityHistory.push(recordedObject.body.velocity.x);
    } else if (playVelocityHistory) {
      if (velocityHistory.length) {
        player.body.velocity.x = velocityHistory.shift();
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

    player.body.bounce.y = 0.1;
    player.body.gravity.y = 1000;
    player.body.collideWorldBounds = true;
    return player;
  }
}
