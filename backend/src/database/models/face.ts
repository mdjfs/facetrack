

import { Table, Column, Model, ForeignKey, BelongsTo, AllowNull } from "sequelize-typescript";
import Person from "./person";

@Table({timestamps: true, tableName: "face", freezeTableName: true})
export default class Face extends Model{


    @ForeignKey(() => Person)
    @AllowNull(false)
    @Column
    personId: number

    @BelongsTo(() => Person)
    person: Person

    @Column
    image: Buffer

    @Column
    mimetype: string

}
