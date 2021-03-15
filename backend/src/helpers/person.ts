import database from "../database";
import User from "../database/models/user";
import FaceManager, { FaceT } from "./recognition";
import { UserTarget } from "./user";

const {models} = database;

const {Face, Person} = models;

interface PersonData{
    names: string,
    surnames: string,
}

async function find(faceManager: FaceManager, targetFace: FaceT, userTarget: UserTarget){
    const user = await User.findOne({ where: { id: userTarget.id }})
    const faces = await Face.findAll({ include: { model: Person, where: { userId: user.id } } });
    let personId: number = null;
    for(const face of faces){
        const [isRecognized, distance] = await faceManager.compareFaces(face.image, targetFace.buffer);
        if(isRecognized && distance <= 0.5){
            personId = face.personId;
            break;
        }
    }
    let person = null;
    if(personId){
        person = await Person.findOne({ where: {id: personId}});
    }
    else{
        person = await Person.create({registered: false, userId: user.id});
    }
    await Face.create({image: targetFace.buffer, mimetype: targetFace.mimetype, personId: person.id});
    return person;
}

async function create(person: PersonData, user: UserTarget){
    await Person.create({names: person.names, surnames: person.surnames, userId: user.id, registered: true});
}

async function del(id: number, user: UserTarget){
    await Person.destroy({ where: { id: id, userId: user.id}});
}

async function update(id: number, person: PersonData, user: UserTarget){
    await Person.update({ names: person.names, surnames: person.surnames, registered: true}, {where: { id: id, userId: user.id} });
}

async function get(id: number, user: UserTarget){
    return await Person.findOne({ where: { id: id, userId: user.id } });
}

async function getAll(user: UserTarget){
    return await Person.findAll({ where: { userId: user.id } });
}

export {create, del, update, find, get, PersonData, getAll};

export default {create, del, update, find, get, getAll};