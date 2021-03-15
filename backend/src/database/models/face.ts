

import { Table, Column, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import Person from "./person";

@Table({timestamps: true, tableName: "face", freezeTableName: true})
export default class Face extends Model{


    @ForeignKey(() => Person)
    @Column
    personId: number

    @BelongsTo(() => Person)
    person: Person

    @Column
    image: Buffer

    @Column
    mimetype: string

}
