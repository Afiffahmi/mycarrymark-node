import express from "express";
import { db } from "./firebase.js";
import { doc, addDoc, collection } from "firebase/firestore"; 

const router = express.Router();

//Create
router.post("/add", async (request, response) => {
    try {
      if (!request.body.test1 || !request.body.test2) {
        return response.status(400).send({
          message: "send all the required field",
        });
      }
      const docRef = await addDoc(collection(db, "coursework"),{
          test1: request.body.test1,
          test2: request.body.test2
      })
      
      return response.status(201).send("successfully created");
    } catch (error) {
      return response.status(500).send(`${error}`)
    }
  });

export default router;
