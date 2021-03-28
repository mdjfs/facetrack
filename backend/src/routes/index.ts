import passport from "passport";
import express, { Request } from "express";
import multer from "multer";

import User from "../controllers/user";
import Detection from "../helpers/detection";
import Person from "../helpers/person";
import Face from "../helpers/face";
import Camera from "../helpers/camera";

const router = express.Router();
const upload = multer();

const auth = passport.authenticate("jwt", { session: false });

interface UserRequest extends Request {
  user: {
    id: number;
    username: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

router.post("/login", async (req, res) => {
  try {
    const token = await User.login(req.body);
    res.status(200).send(token);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/user/all", auth, async (req: UserRequest, res) => {
  try {
    if (req.user.role == "admin") {
      const users = await User.getAll();
      res.status(200).send(users);
    } else {
      res.sendStatus(403);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/user", async (req, res) => {
  try {
    const token = req.body["isGuest"]
      ? await User.createGuest()
      : await User.register(req.body);
    res.status(200).send(token);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/user", auth, async (req: UserRequest, res) => {
  try {
    const user = await User.read({ id: req.user.id });
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.put("/user", auth, async (req: UserRequest, res) => {
  try {
    await User.update(req.body, { id: req.user.id });
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/user", auth, async (req: UserRequest, res) => {
  try {
    await User.del({ id: req.user.id });
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/detections", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.page && req.query.size) {
      const size = parseInt(req.query.size.toString());
      const page = parseInt(req.query.page.toString());
      const detections = await Detection.getAll(req.user, size, page);
      res.status(200).send(detections);
    } else if (req.query.personId) {
      const personId = parseInt(req.query.personId.toString());
      const detections = await Detection.getPersonDetections(personId);
      res.status(200).send(detections);
    } else {
      const detections = await Detection.getAll(req.user);
      res.status(200).send(detections);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.put("/detections", auth, async (req: UserRequest, res) => {
  try {
    if (req.body.id && req.body.until) {
      const detection = await Detection.update(req.body.id, req.body.until);
      res.status(200).send(detection);
    } else throw new Error("No until and id");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/detections", auth, async (req: UserRequest, res) => {
  try {
    const detection = await Detection.create(req.body);
    res.status(200).send(detection);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/person", auth, async (req: UserRequest, res) => {
  try {
    const person = await Person.create(req.body, req.user);
    res.status(200).send(person);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/person", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      const person = await Person.get(id, req.user);
      res.status(200).send(person);
    } else {
      const persons = await Person.getAll(req.user);
      res.status(200).send(persons);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.put("/person", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      await Person.update(id, req.body, req.user);
      res.sendStatus(200);
    } else res.sendStatus(500);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/person", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      await Person.del(id, req.user);
      res.sendStatus(200);
    } else res.sendStatus(500);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/face", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      const face = await Face.getById(id);
      res.setHeader("Content-Type", face.mimetype);
      res.status(200).send(face.image);
    } else if (req.query.personId) {
      const personId = parseInt(req.query.personId.toString());
      const faces = await Face.getByPerson(personId);
      const ids = faces.map((face) => face.id);
      res.status(200).send(ids);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post(
  "/face",
  auth,
  upload.array("photos"),
  async (req: UserRequest, res) => {
    try {
      if (req.query.personId) {
        const personId = parseInt(req.query.personId.toString());
        for (const file of req.files as Express.Multer.File[]) {
          await Face.create(
            { buffer: file.buffer, mimetype: file.mimetype },
            personId,
            req.user
          );
        }
        res.sendStatus(200);
      } else res.sendStatus(500);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

router.delete("/face", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      await Face.del(id, req.user);
      res.sendStatus(200);
    } else res.sendStatus(500);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/cameras", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      const camera = await Camera.get(id, req.user);
      res.status(200).send(camera);
    } else {
      const cameras = await Camera.getAll(req.user);
      res.status(200).send(cameras);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/cameras", auth, async (req: UserRequest, res) => {
  try {
    const camera = await Camera.create(req.body.name, req.user);
    res.status(200).send(camera);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.put("/cameras", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      await Camera.update(id, req.body.name, req.user);
      res.sendStatus(200);
    } else res.sendStatus(500);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/cameras", auth, async (req: UserRequest, res) => {
  try {
    if (req.query.id) {
      const id = parseInt(req.query.id.toString());
      await Camera.del(id, req.user);
      res.sendStatus(200);
    } else res.sendStatus(500);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

export default router;
