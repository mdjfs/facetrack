import hasha from "hasha";
import Role from "./role";
import { Table, Column, Model, ForeignKey, Unique,  BelongsTo, HasMany, Default } from "sequelize-typescript";
import Person from "./person";
import Camera from "./camera";

@Table({timestamps: true, tableName: "user", freezeTableName: true})
export default class User extends Model{

    @Unique
    @Column
    get username(): string{
        return this.getDataValue("username");
    }

    set username(username: string){
        this.setDataValue("username", this.getDataValue("isGuest") ? null : username);
    }

    @Unique
    @Column
    get email(): string{
        return this.getDataValue("username");
    }

    set email(email: string){
        this.setDataValue("username", this.getDataValue("isGuest") ? null : email);
    }

    @HasMany(() => Person, {onDelete: "CASCADE"})
    persons: Person[]

    @HasMany(() => Camera, {onDelete: "CASCADE"})
    cameras: Camera[]

    @ForeignKey(() => Role)
    @Column
    rolId: number

    @BelongsTo(() => Role)
    role: Role

    @Default(false)
    @Column
    isGuest: Boolean

    @Column
    get password(): string{
        return this.getDataValue("password");
    }

    set password(password: string){
        this.setDataValue("password", this.getDataValue("isGuest") ? null : hasha(password))
    }

    async getRole(): Promise<string>{
        if(this.rolId){
            const role = await Role.findOne({ where: { id: this.rolId } });
            return role.name;
        }else return null;
    }

    async setRole(name: string){
        if(!this.role || (this.role && (this.role.name !== name))){
            const target: Role = await Role.findOne({ where: { name: name } });
            await this.update({rolId: target.id});
        }
    }

}
