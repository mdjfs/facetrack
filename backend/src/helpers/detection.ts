import database from "../database";
import { UserTarget } from "./user";

import Person from "../database/models/person";

const { models } = database;

const { Detection } = models;

interface DetectionData {
  since: Date;
  until: Date;
  cameraId: number;
  personId: number;
}

async function create(data: DetectionData) {
  const detection = await Detection.create({
    since: data.since,
    until: data.until,
    cameraId: data.cameraId,
    personId: data.personId,
  });
  return detection;
}

async function update(id: number, until: Date) {
  await Detection.update({ until: until }, { where: { id: id } });
}

async function get(id: number) {
  return await Detection.findOne({ where: { id: id } });
}

async function getPersonDetections(personId: number) {
  return await Detection.findAll({
    where: { personId: personId },
    order: [["id", "DESC"]],
  });
}

async function getAll(
  userTarget: UserTarget,
  pageSize: number = undefined,
  page: number = undefined
) {
  if (page && pageSize) {
    const offset = page * pageSize;
    return await Detection.findAll({
      offset: offset,
      limit: pageSize,
      include: { model: Person, where: { userId: userTarget.id } },
      order: [["id", "DESC"]],
    });
  } else
    return await Detection.findAll({
      include: { model: Person, where: { userId: userTarget.id } },
      order: [["id", "DESC"]],
    });
}

export { create, update, get, DetectionData, getAll, getPersonDetections };

export default { create, update, get, getAll, getPersonDetections };
