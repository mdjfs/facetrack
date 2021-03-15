
import { Command } from "commander";
import { createDatabase, getDatabase } from "./index";

const program = new Command();

program
.command("restart")
.description("Restarts databse")
.action(async () => {
    try{ 
        const database = await createDatabase();
        const { Role } = database.models;
        await Role.create({name: "admin"});
        await Role.create({name: "user"});
        console.log("Database created.")
    }catch(e){
        console.log(e);
    }
});

program
.command("admin [password]")
.description("Create or modify password of 'admin' account")
.action(async (password) => {
    try{
        const database = getDatabase();
        const { User } = database.models;
        const find = await User.findOne({ where: { username: "admin" } });
        if(find){
            await find.update({password: password});
            await find.setRole("admin");
            console.log("Admin account updated.")
        }else{
            const admin = await User.create({username: "admin", password: password});
            await admin.setRole("admin");
            console.log("Admin account created and updated.")
        }
    }catch(e){
        console.log(e);
    }
});

program.parse(process.argv);