import {keyboard} from './keyboard'
import {Socket} from "phoenix"
import {Player} from "./player"
   
//Aliases
let Application = PIXI.Application,
   Container = PIXI.Container,
   Sprite = PIXI.Sprite,
   loader = PIXI.Loader.shared,
   Assets = {
      player: "images/player.json"
   }

export class Game{


   constructor(domElement, options){
      this.domElement = domElement;
      this.options = options;
      this.init();
   }

   init(){
      //Create the pixi application
      this.app = new Application({width: this.options.width, height: this.options.height});
      //Add the canvas to the document
      this.domElement.appendChild(this.app.view);
      //Load assets
      loader.add([
         Assets.player
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
      let playerSprite = loader.resources[Assets.player].spritesheet;
      this.container = new Container();
      this.app.stage.addChild(this.container);
      this.player = new Player(playerSprite, this.container, this.options);
      let left = keyboard("ArrowLeft"),
         right = keyboard("ArrowRight"),
         up = keyboard("ArrowUp");
      up.press = () => { this.sendKey('up.press'); };
      right.press = () => { this.sendKey('right.press') }
      right.release = () => { this.sendKey('right.release') }
      left.press = () => { this.sendKey('left.press') }
      left.release = () => { this.sendKey('left.release') }
      this.channel.on('player_move', payload => {
         this.player.move(payload.response)
      });
      this.app.ticker.add(delta => this.gameLoop(delta));
   }

   gameLoop(){
      this.player.update();
   }

   sendKey(key){
      this.channel.push("action", {key: key});
   }

}
