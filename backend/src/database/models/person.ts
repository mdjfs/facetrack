
import { Table, Column, Model, ForeignKey, BelongsTo,  Default, HasMany, AllowNull } from "sequelize-typescript";
import Detection from "./detection";
import Face from "./face";
import User from "./user";

@Table({timestamps: true, tableName: "person", freezeTableName: true})
export default class Person extends Model{


    @ForeignKey(() => User)
    @AllowNull(false)
    @Column
    userId: number

    @BelongsTo(() => User)
    user: User

    @HasMany(() => Face, {onDelete: "CASCADE"})
    faces: Face[]

    @HasMany(() => Detection, {onDelete: "CASCADE"})
    detections: Detection[]

    
    @Default("unknown")
    @Column
    names: string

    
    @Default("unknown")
    @Column
    surnames: string

    @Default(false)
    @Column
    registered: boolean


}
