import express, { request, response } from "express";
import { db } from "./firebase.js";
import {
  doc,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";

const app = express();
const router = express.Router();
app.search(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Create Class
router.post("/new", async (request, response) => {
  try {
    if (!request.body.coursecode || !request.body.coursename || !request.body.part || !request.body.group || !request.body.email ) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const docRef = await addDoc(collection(db, "class"), {
      courseCode: request.body.coursecode,
      courseName: request.body.coursename,
      groupClass: request.body.group,
      part: request.body.part,
      nStudent: 0
    }
    );
    if(docRef){
        const lecRef = await addDoc(collection(db,`class/${docRef._key.path.segments[1]}/lecturer`),{
            email: request.body.email,
        })
    }
    return response.status(201).send(docRef);
  } catch (error) {
    return response.status(500).send(`${error}`);
  }
});

// View class
router.get("/list", async (request, response) => {
  try {
    const classlist = [];
    const querySnapshot = await getDocs(collection(db, "class"));
    for (let doc of querySnapshot.docs) {
      let classData = {
        id: doc.id,
        ...doc.data(),
      };

      const lecturerSnapshot = await getDocs(collection(db, `class/${doc.id}/lecturer`));
      let lecturers = [];
      lecturerSnapshot.forEach((lecDoc) => {
        lecturers.push({
          id: lecDoc.id,
          ...lecDoc.data(),
        });
      });

      classData.lecturers = lecturers;
      classlist.push(classData);
    }
    return response.status(200).send(classlist);
  } catch (error) {
    return response.status(500).send(`${error}`);
  }
});

//update class
router.put("/update/:id", async (request, response) => {
  try {
    if (!request.body.coursecode || !request.body.coursename || !request.body.part || !request.body.group) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const id = request.params;
    const classRef = doc(db, "class", `${id.id}`);

    await updateDoc(classRef, {
      courseCode: request.body.coursecode,
      courseName: request.body.coursename,
      groupClass: request.body.group,
      part: request.body.part,
    });

    return response.status(200).send("successfully updated");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});

//Update
router.put("/:id", async (request, response) => {
  try {
    if (!request.body.test1 || !request.body.test2) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const id = request.params;
    const mcmRef = doc(db, "coursework", `${id.id}`);

    await updateDoc(mcmRef, {
      test1: request.body.test1,
      test2: request.body.test2,
    });

    return response.status(200).send("successfully updated");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});


export default router;


