import canvasService from "../services/canvas"
import assetManager from "../services/assetManager"

const engine = (entities, canvasID) => {
    const canvas = document.getElementById(canvasID)
    const ctx = canvas.getContext("2d")
    let img = assetManager.getAnimationImage("george_background") 
    ctx.setTransform(1,0,0,1,0,0); //reset the transform matrix as it is cumulative
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img,0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);


    for(let entity of entities) {
        if (entity.tag === "player") {

            let playerPos = entity.componentMap['CTransform'].position;
            //Clamp the camera position to the world bounds while centering the camera around the player
            let camX = canvasService.clamp(-playerPos.x + canvas.width/2, -5000, 5000 - canvas.width);
            let camY = canvasService.clamp(-playerPos.y + canvas.height/2, 0, 720 - canvas.height);

            // set boundary for camera movement (need to add level end boundary also)
            // -637 is around the midpoint of screen, need this so canvas only starts translating at this point
            // instead of at (0,0)
            if (-playerPos.x < -637) {
                ctx.translate( camX, camY ); 
            }

            /*
            * Notes: some objects e.g. timer move off screen as they are in
            * fixed position, need to move these with viewport later
            */
            
        }
        
        drawEntity(ctx, entity)
    }  
                                         
}

const drawEntity = (ctx, entity) => {

    if (entity.tag === "timer"){
        const time = entity.componentMap["CTimer"];
        const position = entity.componentMap["CTransform"].position;
        canvasService.draw.text(ctx, "Time Left: " + time.time, position.x, position.y, "36px", "#fff", "Permanent Marker")
    }

    else {
        const animation = entity.componentMap["CAnimation"]
        const transform = entity.componentMap["CTransform"]
        const img = assetManager.getAnimationImage(animation.animName)
        const currentFrame = Math.floor(animation.currentFrame);
        const frameWidth = img.width / animation.numOfFrames;
        const frameHeight = img.height;

        /*
        const bounding = entity.componentMap["CBoundingBox"]
        canvasService.draw.rectangle(ctx, transform.position.x, transform.position.y, bounding.size.x, bounding.size.y, "#ffffff")
        */

        if ("CHealth" in entity.componentMap && entity.componentMap["CHealth"].show === true){
            let currentHealthPercentage = entity.componentMap["CHealth"].health / entity.componentMap["CHealth"].maxHealth;
            canvasService.draw.rectangle(ctx, transform.position.x - 2, transform.position.y - 10, frameWidth + 4, 8, "#860b08");
            canvasService.draw.rectangle(ctx, transform.position.x, transform.position.y - 8, currentHealthPercentage * frameWidth, 6, "#f43a26")
        }

        // drawing reverse
        if (transform.scale === -1){
            ctx.save();
            ctx.translate(transform.position.x, transform.position.y);  //location on the canvas to draw your sprite, this is important.
            ctx.scale(-1, 1);  //This does your mirroring/flipping
            ctx.drawImage(img, currentFrame*frameWidth, 0, frameWidth, frameHeight, -frameWidth, 0, frameWidth, frameHeight);
            ctx.restore();
        }

        else {
            ctx.drawImage(img, currentFrame*frameWidth, 0, frameWidth, frameHeight, transform.position.x, transform.position.y, frameWidth, frameHeight)
        }
    }



    /*
    const bounding = entity.componentMap["CBoundingBox"]
    canvasService.draw.rectangle(ctx, transform.position.x, transform.position.y, bounding.size.x, bounding.size.y, "#ffffff")
    */


}


export default engine