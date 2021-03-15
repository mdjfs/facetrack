import database from "../database";

const { User } = database.models;

interface UserData{
    username: string,
    password: string
}

interface UserOptions{
    role: string
}

interface UserTarget{
    id?:number,
    username?:string,
    password?:string
}

/**
 * Create a user in the database
 * @param data User Data 
 * @param options User Options
 */
async function create(data: UserData, options: UserOptions = undefined){
    const user = await User.create(data);
    if(options){
        await user.setRole(options.role);
    }else{
        await user.setRole("user");
    }
}

/**
 * Get info of user in the database
 * @param target User Target
 */
async function read(target: UserTarget){
    const user = await User.findOne({ where: {...target} });
    const role = await user.getRole();
    return {
        id: user.id,
        username: user.username,
        role: role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

async function getAll(){
    const users = await User.findAll();
    return users;
}

/**
 * Updates user in the database
 * @param data User Data
 * @param target User Target
 * @param options User Options
 */
async function update(data: UserData, target: UserTarget, options: UserOptions = undefined){
    const user = await User.findOne({ where: {...target} });
    if(user){
        await user.update(data);
        if(options){
            await user.setRole(options.role);
        }
    }
}

/**
 * Deletes user in the database
 * @param target User Target
 */
async function del(target: UserTarget){
    await User.destroy({ where: {...target} });
}

export {UserData, UserOptions, UserTarget, create, read, update, del, getAll};

export default {create, read, update, del, getAll};
