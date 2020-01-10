import {keyboard} from './keyboard'
import {Socket} from "phoenix"
   
//Aliases
let Application = PIXI.Application,
   Container = PIXI.Container,
   Sprite = PIXI.Sprite,
   loader = PIXI.Loader.shared;

export class Game{

   constructor(domElement, options){
      this.domElement = domElement;
      this.options = options;
      this.init();
   }

   init(){
      //Create the pixi application
      this.app = new Application({width: this.options.width, height: this.options.height});
      this.container = new Container();
      //Add the canvas to the document
      this.domElement.appendChild(this.app.view);
      //Load assets
      loader.add([
         'images/playerShip1_blue.png'
      ]).load(() => this.setup());
      //Create the socket and connect to it
      let socket = new Socket("/socket", {params: {token: 'javier'}})
      socket.connect()
      this.channel = socket.channel("game:all", {})
      this.channel.join()
        .receive("ok", resp => { console.log("Joined successfully", resp) })
        .receive("error", resp => { console.log("Unable to join", resp) })
   }

   setup(){
      this.player = new Sprite(loader.resources['images/playerShip1_blue.png'].texture);
      this.player.x = 100;
      this.player.y = 430;
      this.player.scale.set(0.5, 0.5);
      this.container.addChild(this.player);
      this.app.stage.addChild(this.container);
      let left = keyboard("ArrowLeft"),
         right = keyboard("ArrowRight");
      right.press = () => { this.sendKey('right_press'); }
      right.release = () => { this.sendKey('right_release'); }
      this.channel.on('player_move', payload => this.player_move(payload));
      this.channel.on('current_rank', payload => console.log(payload));
   }

   sendKey(key){
      this.channel.push("action", {key: key});
   }

   player_move(data) {
      console.log('received from server', data);
   }

   moveRight() {
      console.log('moving right');
   }
   stopMoving() {
      console.log('stop moving');
   }
}
