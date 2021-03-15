

import { Table, Column, ForeignKey, BelongsTo, Model, AllowNull } from "sequelize-typescript";
import Person from "./person";

@Table({timestamps: true, tableName: "detection", freezeTableName: true})
export default class Detection extends Model{


    @ForeignKey(() => Person)
    @Column
    personId: number

    @BelongsTo(() => Person)
    person: Person

    @Column
    @AllowNull(false)
    since: Date

    @Column
    @AllowNull(false)
    until: Date

}
