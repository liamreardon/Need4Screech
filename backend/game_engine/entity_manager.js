/**
 * Entity Manager class using standard ECS architecture.
 */
const Entity = require("./entity");
const Vector = require("./vector");
const EntityModel = require("./default_entity_models");

class EntityManager {
    /*
    This class manages entities
     */
    constructor() {
        this.id = 0;
        this.size = 0;
        this.entities = [];
        this.entitiesToAdd = [];
        this.addModel = new EntityModel(this);
    }

    addEntity(tag=null){
        /** this function adds entities.
         * @param {string} tag type of the component
         * */

        let entity = new Entity(this.id, tag);
        this.id++;
        this.entitiesToAdd.push(entity);

        return entity

    }

    removeInactiveEntities(){
        /** this function removes inactive entities.
         * @param {string} tag type of the component
         * */

        for (let entity of this.entities) {
            if (entity.active === false) {
                let index = this.entities.indexOf(entity);
                this.entities.splice(index, 1);
            }
        }
    }

    getEntities(){
        // standard getter function
        return this.entities;
    }

    loadSerializedEntities(entities){
        const newEntities = []

        const deserialize = (obj) => {
            if(!(obj instanceof Object)){ return } //base case

            for(let i in obj){
                if(obj[i] instanceof Object && obj[i]._isVector === true){ obj[i] = new Vector(obj[i].x, obj[i].y) }
                else { deserialize(obj[i]) }
            }
        }

        for(let i = 0; i < entities.length; i++){
            const entity = this.addEntity(entities[i].tag)
            entity.componentMap = entities[i].componentMap
            deserialize(entity.componentMap)
            newEntities.push(entity)
        }

        this.entities = newEntities
        this.entitiesToAdd = []
    }

    getEntitiesByTag(tag){
        return this.entities.filter(entity => entity.tag === tag)
    }

    getEntityById(id){
        return this.entities.find(entity => entity.id === id)
    }

    update(){
        /** this function does an update, adding entities and removing them.
         * */

        // add entities to entity map
        for (let entity of this.entitiesToAdd) {

            if (entity.id in this.entities){
                throw new Error(`EntityManager@update: Entity "${entity.id}" already found in this.entities.`);
            }
            this.entities.push(entity);
        }

        // clear entitiesToAddMap
        this.entitiesToAdd = [];

        // remove inactive entities
        this.removeInactiveEntities();

        // update size
        this.size = this.entities.length;
    }

    getSize(){
        // standard getter function
        return this.size;
    }

}

// export the entity manager
module.exports = EntityManager;