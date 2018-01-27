import Phaser from 'phaser'
import Capturable from '../sprites/Capturable';

const RECORDING_STATE_CAPTURING = 'RECORDING_STATE_CAPTURING';
const RECORDING_STATE_PLAYING = 'RECORDING_STATE_PLAYING';

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#86c1a6';
  }

  setProp(name, value) {
    this.props[name] = value;
  }

  preload() {
    this.load.image('ground', 'assets/images/loader-bg.png');
    this.load.image('loaderBar', 'assets/images/loader-bar.png');
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

    const killers = this.add.group();
    killers.enableBody = true;

    const spikes = killers.create(300, this.world.height - 72, 'loaderBar');
    spikes.body.immovable = true;

    const cursors = this.input.keyboard.createCursorKeys();

    this.props = {
      banner,
      platformGroup,
      ground,
      player,
      spikes,
      cursors,
      recordings: [],
    }
  }

  update() {
    const {player, platformGroup, cursors, savedVelocity, spikes, pause} = this.props;

    this.physics.arcade.overlap(player, spikes, () => this.gameOver(), null, this);

    if (!pause) {
      this.playGameLoop();
    }
  }

  playGameLoop() {
    const {player, platformGroup, cursors, savedVelocity} = this.props;
    const hitPlatform = this.physics.arcade.collide(player, platformGroup);

    // On restaure la vélocité sauvegardée
    if (savedVelocity) {
      player.body.velocity.x = savedVelocity.x;
      player.body.velocity.y = savedVelocity.y;
      this.props.savedVelocity = null;
    }

    // Ralentissement
    if (player.body.velocity.x > 10) {
      player.body.velocity.x -= 10;
    } else if (player.body.velocity.x >= -10) {
      player.body.velocity.x = 0;
    } else {
      player.body.velocity.x += 10;
    }

    if (cursors.left.isDown) {
      player.body.velocity.x = -20;
      player.animations.play('left');
    }
    else if (cursors.right.isDown) {
      player.body.velocity.x = 20;
      player.animations.play('right');
    }
    else {
      player.animations.stop();
      player.frame = 4;
    }

    // Jump
    if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
      player.body.velocity.y = -50;
    }

    // Checking for the hold
    const isCapturing = !!this.props.recordings.find(recording => recording.state === RECORDING_STATE_CAPTURING);
    const newVelocity = {x: 0, y: 0};
    this.props.recordings = this.calculateRecordings(isCapturing, newVelocity);

    if (Math.abs(newVelocity.x) > 0) {
      player.body.velocity.x = newVelocity.x;
    }
    if (Math.abs(newVelocity.y) > 0) {
      player.body.velocity.y = newVelocity.y;
    }

    if (isCapturing) {
      player.body.gravity.y = 10;
      this.props.savedVelocity = Object.assign({}, player.body.velocity);
      player.body.velocity.x = player.body.velocity.x / 20;
      player.body.velocity.y = player.body.velocity.y / 20;
    } else {
      player.body.gravity.y = 500;
    }
  }

  createBanner() {
    const bannerText = 'Level 1';
    const hiddenY = -50;
    const displayedY = 50;

    const banner = this.add.text(this.world.centerX, hiddenY, bannerText, {
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
      startRecording: () => {
        this.props.recordings.push({
          target: capturable,
          velocities: [],
          force: 0,
          state: RECORDING_STATE_CAPTURING,
          averageXVel: 0,
          averageYVel: 0,
        })
      }
    });
    platformGroup.add(capturable);
    capturable.body.velocity.x = initialVelocity.x;
    capturable.body.velocity.y = initialVelocity.y;
    capturable.body.immovable = true;

    return capturable
  }

  calculateRecordings(isCapturing, newVelocity) {
    return this.props.recordings
      .filter(recording => recording.state !== RECORDING_STATE_PLAYING || recording.velocities.length)
      .map((recording) => {
        let {velocities, target, state, averageXVel, averageYVel} = recording;

        if (state === RECORDING_STATE_CAPTURING) {
          if (this.input.activePointer.isUp) {
            state = RECORDING_STATE_PLAYING;
            averageXVel = velocities.reduce((acc, vel) => acc + vel.x, 0) / velocities.length;
            averageYVel = velocities.reduce((acc, vel) => acc + vel.y, 0) / velocities.length;
          } else {
            velocities.push(target.body.velocity);
          }
        }
        if (state === RECORDING_STATE_PLAYING && velocities.length && !isCapturing) {
          velocities.shift();
          newVelocity.x += averageXVel;
          newVelocity.y += averageYVel;
        }
        return Object.assign({}, recording, {velocities, state, averageXVel, averageYVel});
      });
  }

  gameOver() {
    const {player} = this.props;
    const youDied = this.add.text(this.world.centerX, this.world.centerY - 50, 'You died', {
      font: '60px Bangers',
      fill: '#993333',
      smoothed: false
    });

    youDied.padding.set(10, 16);
    youDied.anchor.setTo(0.5);

    const restart = this.add.text(this.world.centerX, this.world.centerY, 'Restart', {
      font: '30px Bangers',
      fill: '#993333',
      smoothed: false
    });
    restart.padding.set(10, 16);
    restart.anchor.setTo(0.5);

    restart.inputEnabled = true;
    restart.events.onInputDown.add(() => {
      this.game.state.start('Level1', true, false);
    });

    this.props.pause = true;
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.gravity.y = 0;
  }
}
