import express from "express";
import { db } from "./firebase.js";
import {
  doc,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const app = express();
const router = express.Router();
app.search(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Create Class
router.post("/", async (request, response) => {
  try {
    if (!request.body.test1 || !request.body.test2) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const docRef = await addDoc(collection(db, "class"), {
      courseCode: request.body.coursecode,
      courseName: request.body.coursename,
      groupClass: request.body.groupclass,
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

//delete data
router.delete("/:id", async (request, response) => {
  const id = request.params;
  try {
    const result = await deleteDoc(doc(db, "coursework", `${id.id}`));
    console.log(result);
    return response.status(200).send("successfully delete");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});

//read single data
router.get("/:id", async (request, response) => {
  let carrymarks = [];
  const id = request.params;
  try {
    const querySnapshot = await getDocs(collection(db, "/class/E4BUUVwIIYICW3zJTr1Q/lecturer/"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.email} = ${id.email}`);
      if (doc.id === id.id) {
        carrymarks.push({
          id: doc.id,
          ...doc.data(),
        });
        return response.status(200).send(carrymarks);
      }
    });
    return response.status(500).send("not found");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});

//Read All
router.get("/", async (request, response) => {
  let carrymarks = [];
  try {
    const querySnapshot = await getDocs(collection(db, "class"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      carrymarks.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return response.status(200).send(carrymarks);
  } catch (error) {
    return response.status(500).send(`${error}`);
  }
});

export default router;


