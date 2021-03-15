
import dgram from "dgram";

import {FaceManager, FaceT} from "../helpers/recognition";
import personHelper from "../helpers/person";
import detectionHelper from "../helpers/detection";
import jwt from "jsonwebtoken";
import config from "../config";


import { UserTarget } from "../helpers/user";
import User from "../database/models/user";

interface Frame{
    mode: "start"|"process"|"end",
    buffer?: Buffer
    index?: number
    token?: string
    total?: number,
    cameraId?: number,
    mimetype?: string
}

interface Client{
    data: User,
    cameras: {
        [id: number]: Frame[]
    }
}

interface Request{
    [id: number]: Client
}

const clients: Request = {};
const server = dgram.createSocket("udp4");
let faceManager = null;


function rememberClient(ip: string, user: UserTarget){
    clients[ip] = user;
}

function forgetClient(ip: string){
    delete clients[ip];
}

function trackImage(frames: Frame[], cameraId: number, client: Client){
    console.log(frames.length, frames[0].total);
    if(frames.length == frames[0].total){
        const buffer = Buffer.concat(frames.map(frame => Buffer.from(frame.buffer["data"])));
        const mimetype = frames[0].mimetype;
        loadImage(buffer, mimetype, cameraId, client);
    }
}

function openStream(cameraId: number, user: User){
    const client = clients[user.id];
    const camera = client.cameras[cameraId];
    if(camera && camera.length > 0) trackImage(camera.slice(), cameraId, client);
    client.cameras[cameraId] = [];
}

function closeStream(cameraId: number, user: User){
    const client = clients[user.id];
    const camera = client.cameras[cameraId];
    if(camera) trackImage(camera.slice(), cameraId, client);
    client.cameras[cameraId] = [];
}

async function loadImage(buffer: Buffer, mimetype: string, cameraId: number, client: Client){
    if(faceManager){
        const faces = await faceManager.getFaces(buffer, {format: "buffer", mimetype: mimetype});
        const date = new Date();
        for(const face of faces){
            const person = await personHelper.find(faceManager, face as FaceT, client.data);
            const detections = await detectionHelper.getPersonDetections(person.id);
            let updated = false;
            for(const detection of detections){
                const msDifference = Math.abs( date.getTime() - detection.until.getTime() )
                if(msDifference < 6000 * 60 * 10 ){ // 10 min
                    await detectionHelper.update(detection.id, date);
                    updated = true;
                    break;
                }
            }
            if(!updated)
                await detectionHelper.create({since: date, until: date, cameraId: cameraId}, person.id);
        }
    }
}


async function decodeToken(token: string){
    const decoded = jwt.verify(token, config.secretKey) as object;
    const id = decoded["id"];
    if(id){
        if(!clients[id]){
            const data = await User.findOne({ where: { id: decoded["id"] }});
            clients[id] = {
                data: data,
                cameras: {}
            }
        }
        return id;
    }else return null;
}

function stream(id: number, cameraId: number, request: Frame){
    if(clients[id].cameras[cameraId]){
        clients[id].cameras[cameraId].push(request);
    }else clients[id].cameras[cameraId] = [request];
}

function init(instance: FaceManager, port: number){
    faceManager = instance;
    server.on("error", (err) => {
        console.log(`UDP server error:\n${err.stack}`);
        server.close();
    });
    server.on("listening", () => {
        const address = server.address();
        console.log(`UDP server listening on ${address.address}:${address.port}`);
    });
    server.on("message", async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
        const request: Frame = JSON.parse(msg.toString());
        const id = await decodeToken(request.token);
        console.log(request.index);
        if(id){
            switch(request.mode){
                case "start":
                    openStream(request.cameraId, clients[id].data);
                    break;
                case "end":
                    closeStream(request.cameraId, clients[id].data);
                    break;
                case "process":
                    stream(id, request.cameraId, request)
                    break;
            }
        }
    });
    server.bind(port);
}

export {rememberClient, forgetClient, init, Client};

export default {rememberClient, forgetClient, init};