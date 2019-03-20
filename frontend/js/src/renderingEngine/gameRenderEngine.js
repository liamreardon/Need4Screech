import canvasService from "../services/canvas"
import assetManager from "../services/assetManager"

const engine = (entities, canvasID) => {
    const canvas = document.getElementById(canvasID)
    const ctx = canvas.getContext("2d")
    let img = assetManager.getAnimationImage("george_background")
    
    //canvasService.draw.rectangle(ctx, 0, 0, canvas.width, canvas.height, "#42adf4")

    ctx.drawImage(img,0,0)

    for(let entity of entities){ drawEntity(ctx, entity) }
}

const drawEntity = (ctx, entity) => {
    const animation = entity.componentMap["CAnimation"]
    const transform = entity.componentMap["CTransform"]
    const img = assetManager.getAnimationImage(animation.animName)
    const currentFrame = Math.floor(animation.currentFrame);
    const frameWidth = img.width / animation.numOfFrames;
    const frameHeight = img.height;

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



    /*
    const bounding = entity.componentMap["CBoundingBox"]
    canvasService.draw.rectangle(ctx, transform.position.x, transform.position.y, bounding.size.x, bounding.size.y, "#ffffff")
    */


}

export default engine