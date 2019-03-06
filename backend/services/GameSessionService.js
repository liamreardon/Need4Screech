const config = require("../../config")
const uuid = require("uuid")
const GameEngine = require("../game_engine/game_play");
const { tickRate } = config.gameSessionService

/**
 * The GameSessionService provides an interface for adding and removing game sessions (that is,
 * distinct in-game instances). It is also responsible for managing the rate of lifecycle updates
 * for the game sessions.
 */
class GameSessionService {
    constructor(){
        this.sessions = {} //stores the GameEngine instance for each game session
        this.updateIntervals = {} //stores references to the update interval loop for each session
    }

    addSession(){
        const sessionEngine = new GameEngine()
        
        const sessionId = uuid.v4()
        this.sessions[sessionId] = sessionEngine
        this.updateIntervals[sessionId] = setInterval(() => this._updateGame(sessionEngine), 1000/tickRate)

        return sessionId
    }

    removeSession(sessionId){
        if(!(sessionId in this.sessions)){
            console.log(`GameSessionService@removeSession: Provided sessionId "${sessionId}" not found`)
            return
        }

        clearInterval(this.updateIntervals[sessionId])

        const sessionEngine = this.sessions[sessionId]
        sessionEngine.cleanup()

        delete this.sessions[sessionId]
        delete this.updateIntervals[sessionId]
    }

    _updateGame(gameEngine){
        gameEngine.update()
    }
}

module.exports = new GameSessionService()