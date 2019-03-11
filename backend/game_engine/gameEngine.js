// imports
const components = require("./components");
const EntityManager = require("./entity_manager");
const entity_manager = new EntityManager();
const config = require("./../../config-template.json");
const Vector = require("./vector");


class GameEngine {

    constructor(){
        this.player = entity_manager.addEntity( "player");

        let gameStarted = false;


    }

     spawnPlayer() {
        /*
        This function spawns a player, adding all the necessary components
         */
        console.log('spawning player now');
        player.addComponent(components.CLifeSpan(config.player.lifeSpan));
        player.addComponent(components.CGravity(config.game_engine.gravity));
        player.addComponent(components.CHealth(config.player.health));

        // CInput
        up = false;
        down = false;
        left = false;
        right = false;
        canShoot = false;
        player.addComponent(components.CInput(up, down, left, right, canShoot));

        // CTransform
        let position = new Vector(100, 100);
        let previous_position = new Vector(0, 0);
        let velocity = new Vector(0, 0);
        player.addComponent(components.CTransform(position, previous_position,1, velocity,0));
        console.log('player spawned. player object:', player);

        player.addComponent(components.CAnimation('stand64',1,0,0))
    }

     startGame() {
        // this function starts the game, spawning the player and other necessary things

        console.log('starting game');
        spawnPlayer();
        entity_manager.update();
        console.log('game started');
    }

    update(){
        // this function handles the update function, starting a game if it hasn't been already
        if (!gameStarted){
            startGame();
            gameStarted = true;
        }
        else {
            console.log('game continuing');
            sMovement();
            entity_manager.update();
        }
    }

    sMovement(){
        // movement system

        let playerInput = player.getComponent('CInput');
        let playerTransform = player.getComponent('CTransform');

        if (playerInput.up) {
            playerTransform.velocity.y = config.player.jump;
        }

        if (playerInput.left) {
            playerTransform.velocity.x = -config.player.speed;
            //playerTransform.scale.x = -1
        }

        if (playerInput.right) {
            playerTransform.velocity.x = config.player.speed;
            //playerTransform.scale.x = 1
        }

        if (playerInput.left && playerInput.right) {
            playerTransform.velocity.x = 0;
            //playerTransform.scale.x = 1
        }
    }

    returnGameState(){
        /*
        this function returns the game state as an object
         */
        return {
            'player': entity_manager.getEntitiesByTag('player')[0],
            'enemies': entity_manager.getEntitiesByTag('enemy'),
            'tiles': entity_manager.getEntitiesByTag('tile'),
            'bullets': entity_manager.getEntitiesByTag('bullet')
        };
    }






}






module.exports = {player, update, returnGameState};

