
/** TensorFlow version: 1.7.0
 * face-api.js version: 0.22.2
 *  Works on linux
 */

 import * as tf from "@tensorflow/tfjs-node";


 import * as faceapi from "face-api.js";
 import { FaceDetection } from "face-api.js";
 
 import sharp from "sharp";

 import path from "path";
 
 
 interface cropOpts{
     mimetype: string
 }
 
 interface FaceT extends cropOpts{
     buffer: Buffer
 }
 
 interface getFacesOpts extends cropOpts{
    format: "buffer"|"detection"
}
 
const networksPath = path.join(__dirname, "../networks");
 
 
 export {FaceT, getFacesOpts, cropOpts, FaceManager};
 
 export default class FaceManager {
 
 
 
     hasInit: boolean;
 
     constructor(){
         this.hasInit = false;
     }

     /** Crop the face */
     private  async crop(image: Buffer, box: faceapi.Box, opts: cropOpts): Promise<FaceT>{
 
        let framewidth = 100;
        let frameheight = 100;
        let {x, y, width, height} = box;
        while(x - framewidth <=0) framewidth--;
        while(y - frameheight <=0) frameheight--;
        x = Math.trunc ( x - framewidth/2 );
        y = Math.trunc ( y - frameheight/2 );
        width = Math.trunc ( width + framewidth );
        height = Math.trunc ( height + frameheight );
    
        const buffer: Buffer = await sharp(image)
        .extract({width: width, 
                height: height, 
                left: x, 
                top: y}).toBuffer();
        
        return {
            buffer: buffer,
            mimetype: opts.mimetype
        };
    
    }

    /** get neural input from buffer */
    private  getImage(input: Buffer){
        const image = tf.node.decodeImage(input);
        return image;
    }
    
    /** load the neural networks */
    async init(){
         const {ssdMobilenetv1, faceLandmark68Net, faceRecognitionNet} = faceapi.nets;
         // neural networks type extends of NeuralNetwork<NetParams> from tfjs-image-recognition-base
         await Promise.all([
             ssdMobilenetv1.loadFromDisk(path.join(networksPath, "./ssd_mobilenetv1")),
             faceLandmark68Net.loadFromDisk(path.join(networksPath, "./face_landmark_68")),
             faceRecognitionNet.loadFromDisk(path.join(networksPath, "./face_recognition"))
         ]);
         this.hasInit = true;
     }
     
     /** get faces from image (buffer) */
     async getFaces(input: Buffer, opts: getFacesOpts = {format: "detection", mimetype: "image/jpeg"}): Promise<FaceT[]|FaceDetection[]>{
         if(!this.hasInit) throw new Error("FaceManager isn't initialized.");
         const decoded = this.getImage(input);
         const detections: FaceDetection[] = await faceapi.detectAllFaces(decoded);
         if(opts.format == "detection") return detections;
         else{
             const faces: FaceT[] = [];
             for(const detection of detections){
                 const face = await this.crop(input, detection.box, {mimetype: opts.mimetype});
                 faces.push(face);
             }
             return faces;
         }
     }
     
     /** compare two faces */
     async compareFaces(input:Buffer, target: Buffer): Promise<[boolean, number]>{
         if(!this.hasInit) throw new Error("FaceManager isn't initialized.");
         const decodedInput =  this.getImage(input);
         const decodedTarget =  this.getImage(target);
         const detectInput = await faceapi.detectSingleFace(decodedInput).withFaceLandmarks().withFaceDescriptor();
         const detectTarget = await faceapi.detectSingleFace(decodedTarget).withFaceLandmarks().withFaceDescriptor();
         const matcher = new faceapi.FaceMatcher(detectInput);
         const match = matcher.findBestMatch(detectTarget.descriptor);
         return [match.label !== "unknown", match.distance];
     }
 };