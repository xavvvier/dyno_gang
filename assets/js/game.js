import {keyboard} from './keyboard'
import {Socket} from "phoenix"
import {Player} from "./player"
   
//Aliases
let Application = PIXI.Application,
   Container = PIXI.Container,
   Sprite = PIXI.Sprite,
   loader = PIXI.Loader.shared,
   Assets = {
      virtualguy: "images/virtualguy.json",
      ninjafrog: "images/ninjafrog.json",
      maskdude: "images/maskdude.json",
      pinkman: "images/pinkman.json",
      background: "images/backgrounds/stars_blue.png",
      obstacle1: "images/fan.json",
      obstacle2: "images/fire.json",
      obstacle3: "images/rockhead.json",
      obstacle4: "images/spikehead.json"
   }

export class Game{


   constructor(domElement, options, username, character){
      this.domElement = domElement;
      this.options = options;
      this.username = username;
      this.character = character;
      this.init();
   }

   init(){
      //Create the pixi application
      this.app = new Application({width: this.options.width, height: this.options.height});
      //Add the canvas to the document
      this.domElement.appendChild(this.app.view);
      //Load assets
      loader.add([
         Assets.virtualguy,
         Assets.ninjafrog,
         Assets.maskdude,
         Assets.pinkman,
         Assets.background,
         Assets.obstacle1,
         Assets.obstacle2,
         Assets.obstacle3,
         Assets.obstacle4
      ]).load(() => this.setup());
      //Create the socket and connect to it
      this.socket = new Socket("/socket", {params: {token: window.userToken}})
      this.socket.connect()
      this.score = 0;
      this.isGameOver = false;
   }

   setup(){
      this.channel = this.socket.channel("game:all", {character: this.character})
      this.channel.join()
        .receive("ok", resp => this.onConnected(resp)) 
        .receive("error", resp => console.log("Unable to join", resp))
      let playerSprite = loader.resources[Assets[this.character]].spritesheet;
      let bgTexture = loader.resources[Assets.background].texture;
      //Contains all the other players
      //adding this container first will put other players behind the local player
      //(added after setup initialization)
      this.otherPlayersContainer = new Container();
      //Contains all the elements in the stage
      this.container = new Container();
      this.app.stage.addChild(this.container);
      this.bgSprite = new PIXI.TilingSprite(bgTexture, this.options.width, this.options.height);
      this.container.addChild(this.bgSprite);
      this.container.addChild(this.otherPlayersContainer);
      this.player = new Player(playerSprite, this.container, this.options);
      this.players = {};
      this.obstacles = [];
      this.keyBindings();
      //Update the player based on the data received from the server
      this.channel.on('player_move', data => { this.gameAction(data.response.players) })
      this.channel.on('obstacle_event', data => {this.onNewObstacle(data);})
      this.channel.on('player_joined', data => {this.onPlayerJoin(data);})
      this.channel.on('player_left', data => {this.onPlayerLeave(data);})
      this.channel.on('player_dead', data => {this.onPlayerDead(data);})
      this.player.onJumpFinished = () => { this.sendKey('up.release') };
      this.drawScore();
      this.gameLoop();
   }

   drawScore(){
      let opts = {
         fontFamily: 'pixellari',
         fontSize: 20,
         fill: ['#ffffff', '#00ff99'],
         dropShadow: true,
         dropShadowColor: '#000000',
         dropShadowBlur: 4,
         dropShadowAngle: Math.PI / 6,
         dropShadowDistance: 6,
         align: 'right'
      };
      this.scoreText = new PIXI.Text(this.score, opts);
      this.scoreText.x = 30;
      this.scoreText.y = 30;
      this.container.addChild(this.scoreText);
      opts = {
         fontFamily: 'pixellari',
         fontSize: 15,
         fill: ['#ffffff', '#82c4ec'],
         align: 'right',
      };
      this.othersScoreText = new PIXI.Text("", opts);
      this.othersScoreText.anchor.set(1,0);
      this.othersScoreText.x = this.options.width - 10;
      this.othersScoreText.y = 30;
      this.container.addChild(this.othersScoreText);
   }

   onConnected(resp){
     //render the players already playing
     for(const player in resp.players) {
        if(resp.players[player].alive){
           this.onPlayerJoin(resp.players[player]);
        }
     }
   }

   keyBindings(){
      //Key binding
      let left = keyboard("ArrowLeft"),
         right = keyboard("ArrowRight"),
         up = keyboard("ArrowUp");
      up.press = () => { this.sendKey('up.press'); };
      right.press = () => { this.sendKey('right.press') }
      right.release = () => { this.sendKey('right.release') }
      left.press = () => { this.sendKey('left.press') }
      left.release = () => { this.sendKey('left.release') }

   }

   onNewObstacle(data) {
      let types = [Assets.obstacle1, Assets.obstacle2, Assets.obstacle3, Assets.obstacle4];
      let type = types[data.type-1];
      let spritesheet = loader.resources[type].spritesheet;
      let obstacle = new PIXI.AnimatedSprite(spritesheet.animations.default);
      obstacle.animationSpeed = 0.1;
      obstacle.anchor.set(0.5, 1);
      obstacle.y = this.options.height - 20;
      obstacle.x = this.options.width + obstacle.width;
      this.container.addChild(obstacle);
      this.obstacles.push(obstacle);
      obstacle.play();
   }

   onPlayerJoin(data) {
      let playerSprite = loader.resources[Assets[data.character]].spritesheet;
      let player = new Player(playerSprite, this.otherPlayersContainer, this.options); 
      player.setTransparency();
      this.players[data.name] = player;
      //If the player doesn't have a x position, this means someone else joined the game
      //the user will be located in the initial default position. 
      //If the player does have a x position, it means we are joining the game
      //and therefore we need to locate those players in their most recent position
      //update the position based on the last action sent to the server
      if(data.x) { player.x = data.x; }
   }

   onPlayerLeave(data) {
      if(data.name in this.players){
         this.players[data.name].destroy();
         delete this.players[data.name];
      }
   }

   onPlayerDead(data) {
      if(data.name in this.players){
         this.players[data.name].dieAndTint();
      }
   }

   gameAction(movements) {
      if(this.isGameOver){ return;}
      let player_move = movements[this.username];
      //Move local player
      this.player.move(player_move)
      //Move remote players and update score
      let scores = [];
      for(const player_name in movements) {
         if(player_name !== this.username && player_name in this.players){
            this.players[player_name].move(movements[player_name]);
            scores.push(movements[player_name]);
         }
      }
      //update score
      scores.sort((a, b) => b.score - a.score);
      let othersScore = scores.map(s => s.name + ": " + s.score + "\n").join('');
      this.othersScoreText.text = othersScore;
   }

   collide(r1, r2) {
     let margin = 7;
     if (r1.x + r1.width - margin >= r2.x &&    // r1 right edge past r2 left
         r1.x <= r2.x + r2.width -margin &&    // r1 left edge past r2 right
         r1.y + r1.height -margin >= r2.y &&    // r1 top edge past r2 bottom
         r1.y <= r2.y + r2.height - margin) {    // r1 bottom edge past r2 top
           return true;
     }
     return false;
   }

   gameLoop(){
      this.bgSprite.tilePosition.x -= 0.5;
      this.player.update();
      for(const remotePlayer in this.players){
         this.players[remotePlayer].update();
      }
      if(!this.isGameOver) {
         for(const obs of this.obstacles){
            //Move the obstacle
            obs.x -= 3;
            //Remove the obstacle if it's off screen
            if(obs.x < 0 - obs.width){
               this.container.removeChild(obs);
               this.obstacles.splice(this.obstacles.indexOf(obs), 1);
               obs.destroy();
            }
         }
         this.detectCollision();
      } else {
         //Move score text
         if(this.scoreText.steps){
            this.scoreText.x += this.scoreText.vx;
            this.scoreText.y += this.scoreText.vy;
            this.scoreText.style.fontSize += this.scoreText.vfs;
            this.scoreText.steps -= 1;
         }
      }
      requestAnimationFrame(() => this.gameLoop());
   }

   detectCollision(){
      let collision = false;
      for(const obs of this.obstacles){
         //detect collision
         let obsBounds = obs.getBounds();
         let playerBounds = this.player.sprite.getBounds();
         if (this.collide(obsBounds, playerBounds)){
            collision = true;
            break;
         } else if(!obs.counted && obsBounds.x + obs.width < playerBounds.x + 1) {
            //Score if the user overcomes the obstacle
            let extraScore = Math.round(obsBounds.x/this.options.width*2) * 5;
            this.score += (10 + extraScore);
            this.scoreText.text = this.score;
            obs.counted = true;
         }
      }
      if (collision) {
         this.gameOver();
      } 
   }

   gameOver(){
      this.isGameOver = true;
      this.channel.push("die", {});
      this.player.die();
      //Disconnect form channel
      this.channel.leave();
      //Set vx,vy and vfs to animate the scoreText to the center of screen
      let targetPosition = {x: this.options.width/2, y: this.options.height/2};
      let steps = this.scoreText.steps = 20;
      this.scoreText.vx = (targetPosition.x - this.scoreText.x)/steps;
      this.scoreText.vy = (targetPosition.y - this.scoreText.y)/steps;
      let fontSizeTarget = 50;
      this.scoreText.vfs = (fontSizeTarget - this.scoreText.style.fontSize)/steps;
      this.scoreText.anchor.set(0.5);
      this.scoreText.style.align = 'center';
      for(const player in this.players){
         this.players[player].destroy();
         delete this.players[player];
      }
   }

   sendKey(key){
      if(this.isGameOver) { return; }
      //Send the key action to be processed and broadcasted by the server
      this.channel.push("action", {key: key, x: this.player.position.x, score: this.score });
   }

}
