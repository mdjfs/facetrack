
import { Table, Column, Model, ForeignKey, BelongsTo,  Default, HasMany } from "sequelize-typescript";
import Detection from "./detection";
import Face from "./face";
import User from "./user";

@Table({timestamps: true, tableName: "person", freezeTableName: true})
export default class Person extends Model{


    @ForeignKey(() => User)
    @Column
    userId: number

    @BelongsTo(() => User)
    user: User

    @HasMany(() => Face, {onDelete: "CASCADE"})
    faces: Face[]

    @HasMany(() => Detection, {onDelete: "CASCADE"})
    detections: Detection[]

    @Column
    @Default("unknown")
    names: string

    @Column
    @Default("unknown")
    surnames: string

    @Default(false)
    registered: boolean


}
