
import * as path from "path";
import { readFileSync } from "fs";

import { SequelizeOptions } from "sequelize-typescript";

interface configT{
    secretKey: string,
    port?: string,
    database:{
        development: SequelizeOptions,
        test: SequelizeOptions,
        production: SequelizeOptions
    }
}


function makeConfig(): configT{
    try{
        const json: configT = JSON.parse(readFileSync(path.join(__dirname, "../config.json"), { encoding: "utf-8" }));
        return json;
    }
    catch(e){
        console.error(`Error loading config file: ${e.toString()}`);
        return undefined;
    }
}

const config: configT = process.env.USE_ENV ? undefined : makeConfig();

if(!process.env.USE_ENV){
    const required = ["database", "secretKey"];

    for(const key of required)
        if(!config[key]) throw new Error(`${key} is required in config.json`);
}


export default process.env.USE_ENV ? {
    secretKey: process.env.SECRET_KEY,
    port: process.env.PORT,
    database: {
        development:{
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME,
            host: process.env.DATABASE_HOST,
            dialect: process.env.DATABASE_DIALECT,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false 
                }
            }
        },
        test:{
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME,
            host: process.env.DATABASE_HOST,
            dialect: process.env.DATABASE_DIALECT,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false 
                }
            }
        },
        production:{
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME,
            host: process.env.DATABASE_HOST,
            dialect: process.env.DATABASE_DIALECT,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false 
                }
            }
        }
    }
} : config;