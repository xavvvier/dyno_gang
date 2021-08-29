// Ghost player.
// This class mimics another player when there is only one player connected in the game
export class Ghost {
  constructor(channel) {
    this.ghostNames = ['Copper', 'Radius', 'Wire', 'Technamic', 'Extreme Travel Bot'];
    this.channel = channel;
    this.character = 'ninjafrog';
    const nameIndex = randomNumber(0, this.ghostNames.length - 1);
    this.username = this.ghostNames[nameIndex];
    this.channel.push('start_ghost', { ghost_name: this.username, character: this.character });
    this.setInitialState();
  }

  setInitialState() {
    this.score = 0;
  }

  update(obstacles, players) {
    let ghostPlayer = players[this.username];
    let obs = obstacles.filter((x) => !x.skipped)[0];
    if  (obs) {
      let obsBounds = obs.getBounds();
      let playerBounds = ghostPlayer.sprite.getBounds();
      let distance = obsBounds.x - playerBounds.x;
      // If ghost is moving right closer to obstacle, update vx to move forward
      if (distance < 120 && ghostPlayer.vx < 0) {
        ghostPlayer.vx = 1; 
      } else {
        this.updateVx(ghostPlayer);
      }
      if (!obs.skipped && distance < 80) {
        obs.skipped = true;
        this.score += 10;
        this.channel.push('ghost_action', { key: 'up.press', x: 0, score: this.score });
        setTimeout(() => {
          this.channel.push('ghost_action', { key: 'up.release', x: 0, score: this.score });
        }, 200);
      }
    }
  }

  updateVx(player) {
    this.waitFor(randomNumber(1000, 3000), () => {
      let fromRight = player.bounds.right - player.sprite.x;
      let fromLeft = player.sprite.x - player.bounds.left;
      let minVx = -2;
      let maxVx = 2;
      // If player is on the right, aim to move it to the left
      if(fromRight < 150) {
        maxVx = 0;
      // If player is on the left, aim to move it to the right
      } else if (fromLeft < 100) {
        minVx = 0;
      }
      if(player.onFloor()) {
        player.vx = randomNumber(minVx, maxVx);
      }
    }) 
  }

  waitFor(millis, then) {
    if (!this.waitHandler) {
      this.waitHandler = setTimeout(() => {
        then();
        this.waitHandler = undefined;
      }, millis)
    }
  }
}

function randomNumber(min, max) {
  return Math.ceil(Math.random() * (max - min) + min);
}
