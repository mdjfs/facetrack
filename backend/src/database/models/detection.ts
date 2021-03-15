

import { Table, Column, ForeignKey, BelongsTo, Model, AllowNull } from "sequelize-typescript";
import Camera from "./camera";
import Person from "./person";

@Table({timestamps: true, tableName: "detection", freezeTableName: true})
export default class Detection extends Model{


    @ForeignKey(() => Person)
    @AllowNull(false)
    @Column
    personId: number

    @BelongsTo(() => Person)
    person: Person

    @ForeignKey(() => Camera)
    @AllowNull(false)
    @Column
    cameraId: number

    @BelongsTo(() => Camera)
    camera: Camera

    @AllowNull(false)
    @Column
    since: Date


    @AllowNull(false)
    @Column
    until: Date

}
