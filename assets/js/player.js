export class Player{
   
   constructor(spriteSheet, container, options) {
      this.spriteSheet = spriteSheet;
      this.sprites = {};
      let border = 20;
      this.speed = 2;
      this.jumping = false;
      this.gravity = 0.3;
      this.vy = 0;
      this.vx = 0;
      this.bounds = {
         top: border,
         left: border,
         bottom: options.height - border,
         right: options.width - border
      };
      this.parentContainer = container;
      this.playerContainer = new PIXI.Container();
      this.loadSprites(spriteSheet);
      this.parentContainer.addChild(this.playerContainer);
      this.state = {};
      this.floor = this.bounds.bottom - this.sprite.height/2;
      this.onJumpFinished = () => {};
      this.dead = false;
   }

   loadSprites(spriteSheet){
      let animations = ['idle', 'run', 'walljump', 'hit', 'jump', 'fall', 'doublejump'];
      for (var anim of animations) {
         this.sprites[anim] = new PIXI.AnimatedSprite(
            spriteSheet.animations[anim]
         );
         this.sprites[anim].id = anim;
         this.sprites[anim].anchor.set(0.5);
         this.sprites[anim].visible = false;
         this.sprites[anim].animationSpeed = 0.3;
         this.playerContainer.addChild(this.sprites[anim]);
      }
      //Create the pixi animated sprite
      this.sprite = this.sprites['idle'];
      this.sprite.visible = true;
      this.sprite.y = this.bounds.bottom - this.sprite.height/2;
      this.sprite.x = 80;
      this.sprite.play();
   }

   setTransparency(){
      this.sprite.alpha = 0.4;
   }

   update(){
      if(this.dead) { return; } 
      let newXPosition = this.sprite.x + this.vx;
      if(newXPosition > this.bounds.left && newXPosition < this.bounds.right){
         this.sprite.x = newXPosition;
      }
      this.sprite.y = this.constrain(this.sprite.y + this.vy, this.bounds.top, this.floor) ;
      let wasJumping = this.vy !== 0;
      this.vy += this.gravity;
      //If the sprite is a floor level, stop y velocity
      if(this.onFloor()) {
         this.vy = 0;
         if(wasJumping){
            this.onJumpFinished();
            //Stop x velocity if no direction is given (no left-right key is pressed)
            if(!this.direction){
               this.vx = 0;
            } else {
               this.vx = this.direction == "right" ? this.speed: -this.speed;
            }
         }
         if(this.vx !== 0){
            this.switchToSprite("run");
         }else{
            this.switchToSprite("idle");
         }
      }
   }

   move(state) {
      this.state = state;
      let [key, action] = this.state.move.split('.');
      //Switch sprite animations based on key action
      //and change speed in x or y axis
      if(state.move == "up.press" && this.onFloor()){ //Only can jump if on the floor
         this.vy = -7;
         this.switchToSprite('jump');
      } else if(key == "right" || key == "left") {
         if(action == "press"){
            this.direction = key;
            //Flips sprite vertically 
            this.sprite.scale.x = this.direction == "left" ? -1 : 1;
            //If when not on the floor, it can't move horizontally
            if(this.onFloor()){
               this.vx = key == "right" ? this.speed: -this.speed;
            }
            //Even when not on the floor, the body still can move though
            this.switchToSprite('run');
         } else {
            //If the release was on the same last key pressed
            if(this.direction == key) {
               if(this.onFloor()){ 
                  //Only stop moving if on the floor
                  //otherwise will stop when the jump finishes
                  this.vx = 0;
                  this.switchToSprite('idle');
               }
               this.direction = "";
            }
         }
      }
   }

   destroy() {
      this.parentContainer.removeChild(this.playerContainer);
      this.playerContainer.destroy({childred: true});
   }

   constrain(n, low, high){
       return Math.max(Math.min(n, high), low);
   }

   onFloor() {
      return this.sprite.y == this.floor;
   }

   switchToSprite(key){
      if(this.sprite.id == key || this.dead) { return; }
      this.sprite.stop();
      this.sprite.visible = false;
      this.previous = this.sprite;
      this.sprite = this.sprites[key];
      this.sprite.x = this.previous.x;
      this.sprite.y = this.previous.y;
      this.sprite.scale.x = this.previous.scale.x;
      this.sprite.alpha = this.previous.alpha;
      this.sprite.visible = true;
      this.sprite.play();
   }

   die(){
      this.switchToSprite('hit');
      this.dead = true;
   }

   dieAndTint(){
      this.die();
      this.sprite.tint = 0xf22059;
   }

   get position() {
      return {x: this.sprite.x, y: this.sprite.y};
   }

   set x(value) {
      this.sprite.x = value;
   }

}
