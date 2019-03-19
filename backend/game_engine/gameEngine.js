// imports
const components = require("./components");
const EntityManager = require("./entity_manager");
const config = require("./../../config-template.json");
const Vector = require("./vector");
const physics = require("./physics");

class GameEngine {

    constructor(sessionId){
        this.sessionId = sessionId;
        this.entity_manager = new EntityManager();
        this.player = this.entity_manager.addEntity("player");
        this.gameStarted = false;
        this.lastInput = {event: "initialized", "87": false, "83": false, "65": false, "68": false, "32": false};
    }

     spawnPlayer() {
        /*
        This function spawns a player, adding all the necessary components
         */
        console.log('spawning player now');
        this.player.addComponent(components.CLifeSpan(config.player.lifeSpan));
        this.player.addComponent(components.CGravity(config.game_engine.gravity));
        this.player.addComponent(components.CHealth(config.player.health));
        this.player.addComponent(components.CAnimation('stand64',1,0,0));

        // CInput
        let up = false;
        let down = false;
        let left = false;
        let right = false;
        let shoot = false;
        let canShoot = true;
        this.player.addComponent(components.CInput(up, down, left, right, shoot, canShoot));

        // CTransform
        let position = new Vector(100, 435);
        let previous_position = new Vector(0, 0);
        let velocity = new Vector(0, 0);
        this.player.addComponent(components.CTransform(position, previous_position,1, velocity,0));
        console.log('player spawned. player object:', this.player);

        //CBoundingBox
         let size = new Vector(64, 64);
         let half_size = new Vector(32, 32);
         this.player.addComponent(components.CBoundingBox(size, half_size));

         //CState
         this.player.addComponent(components.CState("grounded"));
     }

    spawnTiles() {

        for (let x = 0; x < 1280; x+=64){
            let tile = this.entity_manager.addEntity("tile");

            // animation
            tile.addComponent(components.CAnimation('GreyTile',1,0,0))

            // transform
            let position = new Vector(x, 500);
            let previous_position = new Vector(x, 500);
            let velocity = new Vector(0, 0);
            tile.addComponent(components.CTransform(position, previous_position,1, velocity,0));

            //bounding box
            let size = new Vector(64, 64);
            let half_size = new Vector(32, 32);
            tile.addComponent(components.CBoundingBox(size, half_size));
        }

        // extra tiles to jump to
        let x = 192;
        let y = 436;
        for (let i=0; i<5; i++){

            let tile = this.entity_manager.addEntity("tile");

            // animation
            tile.addComponent(components.CAnimation('GreyTile',1,0,0))

            // transform
            let position = new Vector(x, y);
            let previous_position = new Vector(x, y);
            let velocity = new Vector(0, 0);
            tile.addComponent(components.CTransform(position, previous_position,1, velocity,0));

            //bounding box
            let size = new Vector(64, 64);
            let half_size = new Vector(32, 32);
            tile.addComponent(components.CBoundingBox(size, half_size));
            x += 65;
            y -= 65;
        }

    }

     startGame() {
        // this function starts the game, spawning the player and other necessary things

        console.log('starting game');
        this.spawnPlayer();
        this.spawnTiles();
        this.entity_manager.update();
        console.log('game started');
    }

    update(){
        // this function handles the update function, starting a game if it hasn't been already
        if (!this.gameStarted){
            this.startGame();
            this.gameStarted = true;
        }
        else {
            // console.log('game continuing', this.entity_manager.getEntities());
            this.sInput();
            this.sMovement();
            this.sCollision();
            this.sAnimation();
            this.entity_manager.update();
        }
    }


    sInput(){
        // Input system
        
        let CInput = this.player.getComponent('CInput');
        if (this.lastInput.event === "onKeyDown"){
            if (this.lastInput["87"] === true) {
                CInput.up = true;
            }
            if (this.lastInput["65"] === true) {
                CInput.left = true;
            }
            if (this.lastInput["83"] === true) {
                CInput.down = true;
            }
            if (this.lastInput["68"] === true) {
                CInput.right = true;
            }
            if (this.lastInput["32"] === true) {
                CInput.shoot = true;
            }
        }

        if (this.lastInput.event === "onKeyUp"){
            if (this.lastInput["87"] === false) {
                CInput.up = false;
            }
            if (this.lastInput["65"] === false) {
                CInput.left = false;
            }
            if (this.lastInput["83"] === false) {
                CInput.down = false;
            }
            if (this.lastInput["68"] === false) {
                CInput.right = false;
            }
            if (this.lastInput["32"] === false) {
                CInput.shoot = false;
            }
        }

        console.log(CInput)
    }

    sMovement(){
        // movement system

        let playerInput = this.player.getComponent('CInput');
        let playerTransform = this.player.getComponent('CTransform');
        let playerState = this.player.getComponent('CState');
        let newState = playerState.state;

        if (playerInput.up) {
            if (playerState.state === "grounded" || playerState.state === "running"){
                newState = "jumping";
                //playerState.state = "jumping";
                playerTransform.velocity.y = config.player.jump;
                //this.updatePlayerAnimation();
            }
        }

        if (playerInput.left) {
            playerTransform.velocity.x = -config.player.speed;
            playerTransform.scale = -1;
            newState = "running"
        }

        if (playerInput.right) {
            playerTransform.velocity.x = config.player.speed;
            playerTransform.scale = 1;
            newState = "running"
        }

        if (playerInput.down) {
            playerTransform.velocity.y = -config.player.jump;
            newState = "jumping";
        }

        if (playerInput.left && playerInput.right) {
            playerTransform.velocity.x = 0;
            playerTransform.scale = -1;
            newState = "grounded";
        }

        // add inertia
        if (!playerInput.left && !playerTransform.right){

            // if slow enough, stop to 0
            if (Math.abs(playerTransform.velocity.x) < config.player.minSpeed){
                playerTransform.velocity.x = 0;
                newState = "grounded";
                //this.updatePlayerAnimation();
                }

            }

            if (playerTransform.velocity.x > 0){
                playerTransform.velocity.x *= config.player.inertia;
                playerTransform.scale = 1;
                newState = "running"
            }
            else if (playerTransform.velocity.x < 0){
                playerTransform.velocity.x *= config.player.inertia;
                playerTransform.scale = -1;
                newState = "running";
            }

        // update all entities position based on velocity
        for (let entity of this.entity_manager.getEntities()){
            let eTransform = entity.getComponent('CTransform');

            // add gravity effects to every entity that has CGravity
            if (entity.hasComponent('CGravity')){
                let eGravity = entity.getComponent('CGravity');
                eTransform.velocity.y += eGravity.gravity;
            }

            eTransform.previous_position = eTransform.position;
            eTransform.position = eTransform.position.add(eTransform.velocity);
        }

        // truncate player speed if above max
        if (playerTransform.velocity.length() > config.player.maxspeed){
            playerTransform.velocity.normalize();
            playerTransform.velocity = playerTransform.velocity.multiply(config.player.maxspeed);
        }

        if (playerState.state !== newState){
            //console.log('state change from ', playerState.state, ' to ', newState);
            playerState.state = newState;
            this.updatePlayerAnimation();
        }
    }

    sCollision(){

        let playerTransform = this.player.getComponent('CTransform');

        for (let tile of this.entity_manager.getEntitiesByTag("tile")){

            if (tile.hasComponent("CBoundingBox")){
                let tileTransform = tile.getComponent("CTransform");
                let overlap = physics.getOverLap(this.player, tile);

                if (overlap.x > 0 && overlap.y > 0) {

                    let prevOverlap = physics.getPrevOverLap(this.player, tile);

                    if (prevOverlap.y > 0){
                        let direction = tileTransform.position.x > playerTransform.previous_position.x? -1: 1;
                        playerTransform.position.x += direction * overlap.x

                    }

                    if (prevOverlap.x > 0){
                        let direction = tileTransform.position.y > playerTransform.previous_position.y? -1: 1;
                        playerTransform.position.y += direction * overlap.y;
                        playerTransform.velocity.y = 0.0;
                    }
                }
            }
        }

        //update CState
        let state = this.player.getComponent("CState");
        let newState = state.state;
        if (playerTransform.position.y !== playerTransform.previous_position.y){
            newState = "jumping";

        }
        else {
            newState = state.state;
        }

        if (state.state !== newState){
            state.state = newState;
            this.updatePlayerAnimation();
        }

    }

    sAnimation() {

        let animation = this.player.getComponent('CAnimation');

        if (animation.numOfFrames < 2) { return; }

        //console.log('before', animation);
        animation.currentFrame = (animation.currentFrame + animation.speed) % animation.numOfFrames;
        //console.log('after', animation);

    }

    updatePlayerAnimation(){

        let state = this.player.getComponent("CState").state;
        let animation = this.player.getComponent("CAnimation");
        //console.log('called player animation', state);

        switch (state) {

            case "grounded":
                animation.animName = 'stand64';
                animation.numOfFrames = 1;
                animation.currentFrame = 0;
                animation.speed = 0;
                break;

            case "jumping":
                animation.animName = 'air64';
                animation.numOfFrames = 1;
                animation.currentFrame = 0;
                animation.speed = 0;
                break;

            case "running":
                animation.animName = 'run64';
                animation.numOfFrames = 3;
                animation.currentFrame = 0;
                animation.speed = 0.5;
                break;
        }

    }

    returnGameState(){
        return this.entity_manager.getEntities();

        /*
        return {
            'player': this.entity_manager.getEntitiesByTag('player')[0],
            'enemies': this.entity_manager.getEntitiesByTag('enemy'),
            'tiles': this.entity_manager.getEntitiesByTag('tile'),
            'bullets': this.entity_manager.getEntitiesByTag('bullet')
        };
        this function returns the game state as an object
         */
    }

}

module.exports = new GameEngine;
