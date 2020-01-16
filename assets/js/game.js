import {keyboard} from './keyboard'
import {Socket} from "phoenix"
import {Player} from "./player"
   
//Aliases
let Application = PIXI.Application,
   Container = PIXI.Container,
   Sprite = PIXI.Sprite,
   loader = PIXI.Loader.shared,
   Assets = {
      player: "images/player.json",
      background: "images/backgrounds/stars_blue.png"
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
         Assets.player,
         Assets.background
      ]).load(() => this.setup());
      //Create the socket and connect to it
      this.socket = new Socket("/socket", {params: {token: window.userToken}})
      this.socket.connect()
   }

   setup(){
      this.channel = this.socket.channel("game:all", {})
      this.channel.join()
        .receive("ok", resp => { 
           for(const player in resp.players) {
              this.onPlayerJoin(resp.players[player]);
           }
           console.log("Joined successfully")
        })
        .receive("error", resp => { console.log("Unable to join", resp) })
      let playerSprite = loader.resources[Assets.player].spritesheet;
      let bgTexture = loader.resources[Assets.background].texture;
      this.container = new Container();
      this.app.stage.addChild(this.container);
      this.bgSprite = new PIXI.TilingSprite(bgTexture, this.options.width, this.options.height);
      this.container.addChild(this.bgSprite);
      this.player = new Player(playerSprite, this.container, this.options);
      this.players = {};
      //Key binding
      let left = keyboard("ArrowLeft"),
         right = keyboard("ArrowRight"),
         up = keyboard("ArrowUp");
      up.press = () => { this.sendKey('up.press'); };
      right.press = () => { this.sendKey('right.press') }
      right.release = () => { this.sendKey('right.release') }
      left.press = () => { this.sendKey('left.press') }
      left.release = () => { this.sendKey('left.release') }
      //Update the player based on the data received from the server
      this.channel.on('player_move', data => { this.gameAction(data.response.players) })
      // this.channel.on('obstacle_event', data => {console.log(data);})
      this.channel.on('player_joined', data => {this.onPlayerJoin(data);})
      this.channel.on('player_left', data => {this.onPlayerLeave(data);})
      this.player.onJumpFinished = () => { this.sendKey('up.release') };
      this.app.ticker.add(delta => this.gameLoop(delta));
   }

   onPlayerJoin(data) {
      let playerSprite = loader.resources[Assets.player].spritesheet;
      let player = new Player(playerSprite, this.container, this.options); 
      this.players[data.name] = player;
   }

   onPlayerLeave(data) {
      this.players[data.name].destroy();
      delete this.players[data.name];
   }

   gameAction(movements) {
      let player_move = movements[window.userToken];
      //Move local player
      this.player.move(player_move)
      //Move remote players
      for(const player_name in movements) {
         if(player_name !== window.userToken){
            this.players[player_name].move(movements[player_name]);
         }
      }
   }

   gameLoop(){
      this.bgSprite.tilePosition.x -= 0.5;
      this.player.update();
      for(const remotePlayer in this.players){
         this.players[remotePlayer].update();
      }
   }

   sendKey(key){
      //Send the key action to be processed and broadcasted by the server
      this.channel.push("action", {key: key, user: window.userToken});
   }

}
