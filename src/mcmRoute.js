import express from "express";
import { db } from "./firebase.js";
import { doc, addDoc, collection, getDocs } from "firebase/firestore"; 

const app = express();
const router = express.Router();
app.search(express.json());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//Create
router.post("/", async (request, response) => {
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

router.get("/", async (request, response) => {
    let carrymarks = [];
    try{
        const querySnapshot = await getDocs(collection(db, "coursework"));
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          carrymarks.push({
            id: doc.id,
            ...doc.data(),
          });;
        });
        return response.status(200).send(carrymarks);
        

    }catch (error) {
      return response.status(500).send(`${error}`)
    }
})

export default router;
