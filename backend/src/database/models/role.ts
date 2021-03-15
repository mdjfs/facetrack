import { Table, Column, Model, HasMany, Unique } from "sequelize-typescript";
import User from "./user";

@Table({timestamps: true, tableName: "role", freezeTableName: true})
export default class Role extends Model{

    @Unique
    @Column
    name: string

    @HasMany(() => User)
    users: User[]
}
