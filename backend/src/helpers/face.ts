

import database from "../database";
import { UserTarget } from "./user";
import { FaceT } from "./recognition";

const {models} = database;

const { Face, Person } = models;



async function create(face: FaceT, personId: number, user: UserTarget){
    const person = await Person.findOne({ where: {id: personId, userId: user.id }});
    await Face.create({image: face.buffer, mimetype: face.mimetype, personId: person.id})
}

async function del(id: number, user: UserTarget){
    const face = await Face.findOne({ where: { id: id } });
    const person = await Person.findOne({ where: {id: face.personId }});
    if(person.userId == user.id){
        await face.destroy();
    }

}

export default {create, del};
export {create, del};