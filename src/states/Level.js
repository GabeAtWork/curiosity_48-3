import Phaser from 'phaser-ce/build/custom/phaser-split';

export const RECORDING_STATE_CAPTURING = 'RECORDING_STATE_CAPTURING';
export const RECORDING_STATE_PLAYING = 'RECORDING_STATE_PLAYING';
export const GAME_STATE_PLAYING = 'GAME_STATE_PLAYING';
export const GAME_STATE_LOST = 'GAME_STATE_LOST';
export const GAME_STATE_WON = 'GAME_STATE_WON';

export default class extends Phaser.State {
  setProp(name, value) {
    this.props[name] = value;
  }

  preload() {
    this.load.spritesheet('curiosity', 'assets/images/curiosity.png', 32, 32);
    this.load.spritesheet('win-portal', 'assets/images/win-portal.png', 32, 32);
  }

  create() {
    this.physics.startSystem(Phaser.Physics.ARCADE);
  }

  update() {
    const {killers, player, winPortal, pause} = this.props;

    killers.forEach(killer => {
      this.physics.arcade.overlap(player, killer, () => this.gameOver(), null, this);
    });
    this.physics.arcade.overlap(player, winPortal, () => this.gameWon(), null, this);

    if (!pause) {
      this.playGameLoop();
    }
  }

  playGameLoop() {
    const {player, groundGroup, cursors, savedVelocity} = this.props;
    const hitGround = this.physics.arcade.collide(player, groundGroup);

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
      player.animations.stop();
      player.body.velocity.x = -20;
      player.angle = -10;
    }
    else if (cursors.right.isDown) {
      player.animations.stop();
      player.body.velocity.x = 20;
      player.angle = 10;
    }
    else {
      player.angle = 0;

      if (player.body.velocity.x === 0 && hitGround) {
        player.animations.play('idle');
      } else {
        player.animations.stop();
      }
    }

    // Jump
    if (cursors.up.isDown && player.body.touching.down && hitGround) {
      player.body.velocity.y = -100;
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

  gameOver() {
    const {player} = this.props;
    if (this.props.state !== GAME_STATE_LOST) {
      this.displayGameEndUi('You died', '#993333', 'Restart', '#993333', () => {
        this.game.state.start(this.levelReference, true, false);
      });

      this.props.state = GAME_STATE_LOST;
    }
    this.stopGame(player);
  }

  gameWon() {
    const {player, winPortal} = this.props;

    if (this.props.state !== GAME_STATE_WON) {
      winPortal.animations.play('deploy');
      winPortal.animations.currentAnim.onComplete.add(() => {
        this.displayGameEndUi('Level complete', '#fff', this.nextLevelText, '#fff', () => {
          this.game.state.start(this.nextLevelReference, true, false);
        });
      });

      this.props.state = GAME_STATE_WON;
    }
    this.stopGame(player);
  }

  displayGameEndUi(titleText, titleColor, buttonText, buttonColor, onClick) {
    const title = this.add.text(this.world.centerX, this.world.centerY - 50, titleText, {
      font: '60px Bangers',
      fill: titleColor,
      smoothed: false
    });
    title.padding.set(10, 16);
    title.anchor.setTo(0.5);

    const button = this.add.text(this.world.centerX, this.world.centerY, buttonText, {
      font: '30px Bangers',
      fill: buttonColor,
      smoothed: false
    });
    button.padding.set(10, 16);
    button.anchor.setTo(0.5);

    button.inputEnabled = true;
    button.events.onInputDown.add(onClick);
  }

  stopGame(player) {
    this.props.pause = true;
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.gravity.y = 0;
  }

  createBanner() {
    const hiddenY = -50;
    const displayedY = 50;

    const banner = this.add.text(this.world.centerX, hiddenY, this.bannerText, {
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

  createPhysicsGroup() {
    const physicsGroup = this.add.group();
    physicsGroup.enableBody = true;
    return physicsGroup;
  }

  createGround(group, x, y) {
    const ground = group.create(x, y, 'ground');
    ground.body.immovable = true;

    return ground;
  }

  createPlayer(x, y) {
    const player = this.add.sprite(x, y, 'curiosity');

    player.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 10, true);
    player.anchor.setTo(0.5, 0.5);

    this.physics.arcade.enable(player);

    player.body.bounce.y = 0.5;
    player.body.gravity.y = 500;
    player.body.collideWorldBounds = true;
    return player;
  }

  spawnCapturable(capturableData, platformGroup, CapturableType) {
    const {x, y, asset = 'ground', bounds, initialVelocity} = capturableData;

    const capturable = new CapturableType({
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

  spawnKillerGroup() {
    const killers = this.createPhysicsGroup();

    const bottom = killers.create(0, this.world.height - 5);
    bottom.body.immovable = true;
    bottom.body.setSize(this.world.width, 5);

    return killers;
  }

  spawnWinPortal(x, y) {
    const winPortalGroup = this.createPhysicsGroup();
    const winPortal = winPortalGroup.create(x, y, 'win-portal');
    winPortal.body.immovable = true;
    winPortal.animations.add('deploy', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 10, false);
    winPortal.anchor.setTo(0.5, 0.5);
    winPortal.scale.setTo(1.5, 1.5);

    return winPortal;
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
          newVelocity.x += averageXVel * 1.5;
          newVelocity.y += averageYVel * 1.5;
        }
        return Object.assign({}, recording, {velocities, state, averageXVel, averageYVel});
      });
  }
}
