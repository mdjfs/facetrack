
import dgram from "dgram";

import {FaceManager, FaceT} from "../helpers/face";
import personHelper from "../helpers/person";
import detectionHelper from "../helpers/detection";

import { UserTarget } from "../helpers/user";

interface Client{
    [ip: string]: UserTarget
}

const clients: Client = {};
const server = dgram.createSocket("udp4");


function rememberClient(ip: string, user: UserTarget){
    clients[ip] = user;
}

function forgetClient(ip: string){
    delete clients[ip];
}

function init(faceManager: FaceManager, port: number){
    server.on("error", (err) => {
        console.log(`UDP server error:\n${err.stack}`);
        server.close();
    });
    server.on("listening", () => {
        const address = server.address();
        console.log(`UDP server listening on ${address.address}:${address.port}`);
    });
    server.on("message", async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
        if(clients[rinfo.address]){
            const faces = await faceManager.getFaces(msg, {format: "buffer", mimetype: "image/jpeg"});
            const date = new Date();
            for(const face of faces){
                const person = await personHelper.find(faceManager, face as FaceT, clients[rinfo.address]);
                const detections = await detectionHelper.getPersonDetections(person.id);
                let updated = false;
                for(const detection of detections){
                    const msDifference = Math.abs( date.getTime() - detection.until.getTime() )
                    if(msDifference < 60000 * 60 ){ // 1 min
                        await detectionHelper.update(detection.id, date);
                        updated = true;
                        break;
                    }
                }
                if(!updated)
                    await detectionHelper.create({since: date, until: date}, person.id);
            }
        }
    });
    server.bind(port);
}

export {rememberClient, forgetClient, init, Client};

export default {rememberClient, forgetClient, init};