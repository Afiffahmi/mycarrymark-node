import express from "express";
import { db } from "./firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

//Create
router.post("/", async (request, response) => {
  try {
    if (!request.body.test1 || !request.body.test2) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const docRef = await addDoc(collection(db, "coursework"), {
      test1: request.body.test1,
      test2: request.body.test2,
    });

    return response.status(201).send("successfully created");
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
    const querySnapshot = await getDocs(collection(db, "coursework"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} = ${id.id}`);
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
    const querySnapshot = await getDocs(collection(db, "coursework"));
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


