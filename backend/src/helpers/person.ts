import database from "../database";
import FaceManager, { FaceT } from "./recognition";
import { UserTarget } from "./user";
import Face from "./face";

const { models } = database;

const { Person } = models;

interface PersonData {
  names: string;
  surnames: string;
  registered: boolean;
}

async function find(
  faceManager: FaceManager,
  targetFace: FaceT,
  user: UserTarget
) {
  const persons = await Person.findAll({ where: { userId: user.id } });
  let find = null;
  for (const person of persons) {
    const faces = await Face.getByPerson(person.id);
    let facesMatch = 0,
      totalFaces = faces.length;
    for (const face of faces) {
      const [isRecognized, distance] = await faceManager.compareFaces(
        face.image,
        targetFace.buffer
      );
      if (isRecognized && distance <= 0.5) {
        facesMatch++;
      }
    }
    const probability = facesMatch / totalFaces;
    if (probability >= 0.5) {
      find = person;
      break;
    }
  }
  if (!find) {
    find = await Person.create({ registered: false, userId: user.id });
  }
  return find;
}

async function create(person: PersonData, user: UserTarget) {
  return await Person.create({
    names: person.names,
    surnames: person.surnames,
    userId: user.id,
    registered: person.registered,
  });
}

async function del(id: number, user: UserTarget) {
  await Person.destroy({ where: { id: id, userId: user.id } });
}

async function update(id: number, person: PersonData, user: UserTarget) {
  await Person.update(
    {
      names: person.names,
      surnames: person.surnames,
      registered: person.registered,
    },
    { where: { id: id, userId: user.id } }
  );
}

async function get(id: number, user: UserTarget) {
  return await Person.findOne({ where: { id: id, userId: user.id } });
}

async function getAll(user: UserTarget) {
  return await Person.findAll({
    where: { userId: user.id },
    order: [["id", "DESC"]],
  });
}

export { create, del, update, find, get, PersonData, getAll };

export default { create, del, update, find, get, getAll };
