import Phaser from 'phaser-ce';

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
    this.load.spritesheet('player-halo', 'assets/images/effects/Curiosity_charging_halo.png', 64, 64);
    this.load.spritesheet('win-portal', 'assets/images/win-portal.png', 32, 32);
    this.load.image('background', 'assets/images/Background.png');
    this.load.image('background-tower', 'assets/images/environment/BackgroundAsset_01.png');
    this.load.image('fog', 'assets/images/Background_Fog.png');
    this.load.image('foliage-a', 'assets/images/environment/Foliage_01.png');
    this.load.image('foliage-b', 'assets/images/environment/Foliage_02.png');
    this.load.image('foliage-c', 'assets/images/environment/Foliage_03.png');
    this.load.spritesheet('orb-hover', 'assets/images/effects/Orbe_hover.png', 32, 32);
    this.load.image('orb-halo', 'assets/images/effects/halo_orbe_hold.png');
    this.load.image('spikes', 'assets/images/Spikes.png');
    this.load.image('orb-1', 'assets/images/orbs/Orbe01.png');
    this.load.image('orb-1-active', 'assets/images/orbs/Orbe01_Active.png');
    this.load.image('orb-2', 'assets/images/orbs/Orbe02.png');
    this.load.image('orb-2-active', 'assets/images/orbs/Orbe02_Active.png');
    this.load.image('orb-3', 'assets/images/orbs/Orbe03.png');
    this.load.image('orb-3-active', 'assets/images/orbs/Orbe03_Active.png');
  }

  create(addTower) {
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.background = this.add.sprite(0, 0, 'background');
    if (addTower) {
      addTower();
    }
    this.fog = this.add.sprite(0, 0, 'fog');
  }

  update() {
    const {killers, player, winPortal, pause, state} = this.props;

    killers.forEach(killer => {
      this.physics.arcade.overlap(player, killer, () => this.gameOver(), null, this);
    });
    this.physics.arcade.overlap(player, winPortal, () => this.gameWon(), null, this);

    if (!pause) {
      this.playGameLoop();
    }

    if (state === GAME_STATE_WON) {
      this.props.graphics.clear();
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
    this.setPlayerHalo(isCapturing);

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

    this.renderLaser();
  }

  gameOver() {
    const {player} = this.props;
    if (this.props.state !== GAME_STATE_LOST) {
      this.displayGameEndUi('You died', '#FF0101', 'Restart', '#FF0101', () => {
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
    const title = this.add.text(this.world.centerX, this.world.centerY - 50, titleText.toUpperCase(), {
      font: '60px Raleway',
      fill: titleColor,
      smoothed: false
    });
    title.padding.set(10, 16);
    title.anchor.setTo(0.5);
    title.setShadow(-1, 1, 'rgba(0,0,0,0.5)', 0);

    const button = this.add.text(this.world.centerX, this.world.centerY + 100, buttonText.toUpperCase(), {
      font: '30px Raleway',
      fill: buttonColor,
      smoothed: false
    });
    button.padding.set(10, 16);
    button.anchor.setTo(0.5);

    button.inputEnabled = true;
    button.input.useHandCursor = true;
    button.setShadow(-1, 1, 'rgba(0,0,0,0.5)', 0);
    button.events.onInputDown.add(onClick);
  }

  stopGame(player) {
    this.props.pause = true;
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.gravity.y = 0;
    this.props.laserGroup.alpha = 0;
  }

  createBanner() {
    const hiddenY = -50;
    const displayedY = 50;

    const banner = this.add.text(this.world.centerX, hiddenY, this.bannerText.toUpperCase(), {
      font: '40px Raleway',
      fill: '#fff',
      smoothed: false
    });

    banner.padding.set(10, 16);
    banner.anchor.setTo(0.5);
    banner.setShadow(-1, 1, 'rgba(0,0,0,0.5)', 0);

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

  createGround(group, x, y, assetRef = 'ground') {
    const ground = group.create(x, y, assetRef);
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

  createPlayerHalo(player) {
    const playerHalo = this.add.sprite(player.x, player.y, 'player-halo');
    playerHalo.animations.add('idle', [0, 1, 2, 3, 4, 5, 6], 10, true);
    playerHalo.anchor.setTo(0.5, 0.5);
    playerHalo.animations.play('idle');
    return playerHalo;
  }

  setPlayerHalo(isCapturing) {
    const {player, playerHalo} = this.props;
    playerHalo.x = player.x;
    playerHalo.y = player.y;
    playerHalo.alpha = isCapturing ? 1 : 0;
  }

  spawnCapturable(capturableData, platformGroup, CapturableType) {
    const {initialVelocity} = capturableData;

    const capturable = new CapturableType(Object.assign({}, capturableData, {
      game: this.game,
      level: this,
      startRecording: () => {
        const newRecording = {
          target: capturable,
          velocities: [],
          force: 0,
          state: RECORDING_STATE_CAPTURING,
          averageXVel: 0,
          averageYVel: 0,
        };
        this.props.recordings.push(newRecording);
      }
    }));
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
          if (this.input.activePointer.isUp || velocities.length > 50) {
            state = RECORDING_STATE_PLAYING;
            averageXVel = velocities.reduce((acc, vel) => acc + vel.x, 0) / velocities.length;
            averageYVel = velocities.reduce((acc, vel) => acc + vel.y, 0) / velocities.length;
            target.setInactive();
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

  renderLaser() {
    const {player, currentLaserTarget, laserGroup, orbHalo} = this.props;
    if (this.props.graphics) {
      this.props.graphics.destroy();
    }

    if (currentLaserTarget) {
      // rayon = 16
      const line = new Phaser.Line(player.x + 10, player.y, currentLaserTarget.x + currentLaserTarget.width / 2, currentLaserTarget.y + currentLaserTarget.height / 2);
      /*const AC = line.length - currentLaserTarget.width / 2;
      console.log('AC', AC);
      const ACX = AC * Math.cos(line.angle) + player.x - 16;
      const ACY = AC * Math.sin(line.angle) + player.y - 16;
      console.log('AC.x', ACX);
      console.log('AC.y', ACY);
      orbHover.x = ACX;
      orbHover.y = ACY;*/

      const graphics = this.add.graphics(0, 0);
      laserGroup.add(graphics);
      graphics.clear();
      graphics.lineStyle(1, 0xff0101, 1);
      graphics.moveTo(line.start.x, line.start.y);
      graphics.lineTo(line.end.x, line.end.y);
      graphics.endFill();
      this.props.graphics = graphics;
      orbHalo.alpha = 0.8;
      orbHalo.x = currentLaserTarget.x - 14;
      orbHalo.y = currentLaserTarget.y - 14;
      const haloScaleX = 1 + (currentLaserTarget.scale.x - 1) / 2;
      const haloScaleY = 1 + (currentLaserTarget.scale.y - 1) / 2;
      orbHalo.scale.setTo(haloScaleX, haloScaleY);
    } else {
      orbHalo.alpha = 0;
    }
  }

  onCapturableHoverIn(target) {
    const currentClickedCapturable = this.props.recordings.find(recording => recording.state === RECORDING_STATE_CAPTURING);

    if (currentClickedCapturable && currentClickedCapturable.target !== target) {
      if (this.props.hoveredCapturables.indexOf(target) < 0) {
        this.props.hoveredCapturables.push(target);
      }
    } else {
      this.props.hoveredCapturables = [];
      this.props.currentLaserTarget = target;
    }
  }

  onCapturableHoverOut(target) {
    const currentClickedCapturable = this.props.recordings.find(recording => recording.state === RECORDING_STATE_CAPTURING);

    if (this.props.hoveredCapturables.indexOf(target) > 0) {
      this.props.hoveredCapturables = this.props.hoveredCapturables.filter(hoveredCapturable => target === hoveredCapturable);
    }
    if (this.props.currentLaserTarget === target && !currentClickedCapturable) {
      this.props.currentLaserTarget = null;
    }
  }
}
