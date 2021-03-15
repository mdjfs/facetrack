

import database from "../database";
import { UserTarget } from "./user";

const {models} = database;

const { Camera } = models;


async function create(name: string, user: UserTarget){
    await Camera.create({ name: name, userId: user.id});
}

async function update(id: number, name: string, user: UserTarget){
    await Camera.update({ name: name }, { where: {id : id, userId: user.id }});
}

async function get(id: number, userTarget: UserTarget){
    return await Camera.findOne({ where: { id: id, userId: userTarget.id} });
}

async function del(id: number, userTarget: UserTarget){
    await Camera.destroy({ where: { id: id, userId: userTarget.id }});
}

async function getAll(userTarget: UserTarget){
    return await Camera.findAll({ where: { userId: userTarget.id }});
}

export {create,  update,  del, get, getAll};

export default {create,  update,  del, get, getAll};