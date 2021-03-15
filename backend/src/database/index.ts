

import { Sequelize, SequelizeOptions } from "sequelize-typescript";


import Role from "./models/role";
import User from "./models/user";

import config from "../config";
import Person from "./models/person";
import Face from "./models/face";
import Detection from "./models/detection";

const env = process.env.NODE_ENV || 'development';

const databaseConfig: SequelizeOptions = config.database[env];

/**
 * Sync database
 */
async function createDatabase(){
    const database = getDatabase();
    await database.sequelize.sync({force: true});
    return database;
}

/**
 * Get database object
 * @returns {Array[Sequelize, Models]}
 */
function getDatabase(){
    const models = [Role, User, Person, Face, Detection];
    const sequelize = new Sequelize(databaseConfig);
    sequelize.addModels(models);
    return {
        sequelize: sequelize,
        models:{
            Role: Role,
            User: User,
            Face: Face,
            Detection: Detection,
            Person: Person
        }
    };
}

export {createDatabase, getDatabase};
export default getDatabase();