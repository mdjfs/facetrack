import * as path from 'path';
import * as faceapi from 'face-api.js';
import * as sharp from 'sharp';
import { FaceDetection, SsdMobilenetv1Options } from 'face-api.js';
import { ImageData } from 'canvas';

const networks = {
  ssdMobilenetv1: path.join(__dirname, './networks/ssd_mobilenetv1'),
  faceRecognition: path.join(__dirname, './networks/face_recognition'),
  faceLandmark: path.join(__dirname, './networks/face_landmark_68'),
};

faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img'),
});

let loaded = false;

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(networks.ssdMobilenetv1);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(networks.faceLandmark);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(networks.faceRecognition);
  loaded = true;
}

export interface cropOpts {
  mimetype: string;
}

export interface FaceT extends cropOpts {
  buffer: Buffer;
}

export interface FaceMatch {
  confidence: number;
  matched: boolean;
}

export class Recognition {
  async init(): Promise<void> {
    if (!loaded) await loadModels();
  }

  private bufferToUrl(buffer: Buffer, mimetype = 'image/jpeg'): string {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `data:${mimetype};base64,${base64}`;
  }

  async drawDetections(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
  ): Promise<void> {
    const dimensions = {
      width: image.offsetWidth,
      height: image.offsetHeight,
    };
    faceapi.matchDimensions(canvas, dimensions);
    const detections: FaceDetection[] = await faceapi.detectAllFaces(
      image,
      new SsdMobilenetv1Options({ minConfidence: 0.1 }),
    );
    const resizedDetections = faceapi.resizeResults(detections, dimensions);
    faceapi.draw.drawDetections(canvas, resizedDetections);
  }

  /** get faces from image (buffer) */
  async getFaces(input: Buffer, mimetype = 'image/jpeg'): Promise<FaceT[]> {
    await this.init();
    const img = this.getImage(input, mimetype);
    const detections: FaceDetection[] = await faceapi.detectAllFaces(img);
    const faces: FaceT[] = [];
    for (const detection of detections) {
      const face = await this.crop(input, detection.box, {
        mimetype,
      });
      faces.push(face);
    }
    return faces;
  }

  private getImage(input: Buffer, mimetype = 'image/jpeg'): HTMLImageElement {
    const img = document.createElement('img');
    img.src = this.bufferToUrl(input, mimetype);
    return img;
  }

  /** compare two faces */
  async compareFaces(input: FaceT, target: FaceT): Promise<FaceMatch> {
    await this.init();
    const decodedInput = this.getImage(input.buffer, input.mimetype);
    const decodedTarget = this.getImage(target.buffer, target.mimetype);
    const detectInput = await faceapi
      .detectSingleFace(decodedInput)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const detectTarget = await faceapi
      .detectSingleFace(decodedTarget)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const matcher = new faceapi.FaceMatcher(detectInput);
    if (detectTarget) {
      const match = matcher.findBestMatch(detectTarget.descriptor);
      return {
        confidence: match.distance,
        matched: match.label !== 'unknown',
      };
    }
    throw new Error('No match.');
  }

  /** Crop the face */
  private async crop(
    image: Buffer,
    box: faceapi.Box,
    opts: cropOpts,
  ): Promise<FaceT> {
    let framewidth = 100;
    let frameheight = 100;
    let { x, y, width, height } = box;
    while (x - framewidth <= 0) framewidth -= 1;
    while (y - frameheight <= 0) frameheight -= 1;
    x = Math.trunc(x - framewidth / 2);
    y = Math.trunc(y - frameheight / 2);
    width = Math.trunc(width + framewidth);
    height = Math.trunc(height + frameheight);

    const img: sharp.Sharp = sharp(image);
    const extract: sharp.Sharp = img.extract({
      width,
      height,
      left: x,
      top: y,
    });
    const buffer: Buffer = await extract.toBuffer();

    return {
      buffer,
      mimetype: opts.mimetype,
    };
  }
}

export default Recognition;
