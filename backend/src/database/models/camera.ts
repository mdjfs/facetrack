

import { Table, Column,  Model, AllowNull, HasMany, ForeignKey, BelongsTo } from "sequelize-typescript";
import Detection from "./detection";
import User from "./user";

@Table({timestamps: true, tableName: "camera", freezeTableName: true})
export default class Camera extends Model{


    @HasMany(() => Detection)
    detections: Detection[]

    @AllowNull(false)
    @Column
    name: string

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column
    userId: number

    @BelongsTo(() => User)
    user: User

}
