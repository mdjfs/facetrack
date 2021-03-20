import hasha from "hasha";
import {create, read, update, del, UserData, getAll} from "../helpers/user";
import jwt from "jsonwebtoken";
import config from "../config";


/**
 * User Login
 * @param data User Data
 */
async function login(data: UserData): Promise<string>{
    data.password = hasha(data.password);
    const user = await read(data);
    return user ? "Bearer " + jwt.sign({ id: user.id }, config.secretKey) : undefined;
}

/**
 * User Register
 * @param data User Data
 */
async function register(data: UserData): Promise<string>{
    const user = await create(data);
    return user ? "Bearer " + jwt.sign({ id: user.id }, config.secretKey) : undefined;
}

async function createGuest(): Promise<string>{
    const user = await create({isGuest: true});
    return user ? "Bearer " + jwt.sign({ id: user.id }, config.secretKey) : undefined;
}

export {login, register, createGuest};

export default {
    login,
    register,
    update,
    del,
    read,
    getAll,
    createGuest
}