export class Player{
   
   constructor(spriteSheet, container, options) {
      this.spriteSheet = spriteSheet;
      this.sprites = {};
      let border = 20;
      this.bounds = {
         top: border,
         left: border,
         bottom: options.height - border,
         right: options.width - border
      };
      this.speed = 2;
      let animations = ['idle', 'run', 'doublejump'];
      for (var anim of animations) {
         this.sprites[anim] = new PIXI.AnimatedSprite(
            spriteSheet.animations[anim]
         );
         this.sprites[anim].id = anim;
         this.sprites[anim].anchor.set(0.5);
         this.sprites[anim].visible = false;
         this.sprites[anim].animationSpeed = 0.3;
         container.addChild(this.sprites[anim]);
      }
      //Create the pixi animated sprite
      this.sprite = this.sprites['idle'];
      this.sprite.visible = true;
      this.sprite.y = this.bounds.bottom - this.sprite.height/2;
      this.sprite.x = 80;
      this.sprite.play();
   }

   update(){
      let newXPosition = this.sprite.x + this.vx;
      if(newXPosition > this.bounds.left && newXPosition < this.bounds.right){
         this.sprite.x = newXPosition;
      }
   }

   move(data) {
      let playerState = data.players.javier;
      this.setDirection(playerState.direction);
      this.setMoving(playerState.moving);
   }

   setDirection(direction){
      if(direction == "R" && this.sprite.scale.x < 0) {
         this.sprite.scale.x *= -1;
      } else if(direction == "L" && this.sprite.scale.x > 0) {
         this.sprite.scale.x *= -1;
      }
   }

   setMoving(moving) {
      if(moving){
         this.switchToSprite('run');
         this.vx = this.sprite.scale.x < 0 ? -this.speed: this.speed;
      } else {
         this.switchToSprite('idle');
         this.vx = 0;
      }
   }

   switchToSprite(key){
      if(this.sprite.id == key) { return; }
      this.sprite.stop();
      this.sprite.visible = false;
      this.previous = this.sprite;
      this.sprite = this.sprites[key];
      this.sprite.x = this.previous.x;
      this.sprite.y = this.previous.y;
      this.sprite.scale.x = this.previous.scale.x;
      this.sprite.visible = true;
      this.sprite.play();
   }

   moveRight() {
      console.log('moving right');
   }
   stopMoving() {
      console.log('stop moving');
   }
}
