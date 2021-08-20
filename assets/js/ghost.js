// Ghost player.
// This class mimics another player when there is only one player connected in the game
export class Ghost {
  constructor(socket) {
    this.ghostNames = ['Copper', 'Radius', 'Wire', 'Technamic', 'Extreme Travel Bot'];
    this.socket = socket;
    this.character = 'ninjafrog';
    const nameIndex = randomNumber(0, this.ghostNames.length - 1);
    this.username = this.ghostNames[nameIndex];
    this.setup();
  }

  setup() {
    this.channel = this.socket.channel('game:ghost', {
      character: this.character,
      username: this.username,
    });
    this.channel
      .join()
      .receive('ok', (resp) => this.onConnected(resp))
      .receive('error', (resp) => console.log('Unable to join', resp));
    this.channel.on('obstacle_event', (data) => {
      this.onNewObstacle(data);
    });
  }

  onConnected(state) {
    console.log('ghost connected');
  }
  onNewObstacle(data) {
    console.log('obstacle', data);

    this.channel.push('action', { key: 'up.press', x: 59, score: 234 });
  }
}

function randomNumber(min, max) {
  return Math.ceil(Math.random() * (max - min) + min);
}
