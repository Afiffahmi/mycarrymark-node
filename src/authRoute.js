import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { initializeApp } from 'firebase-admin/app';


const app = express();
const router = express.Router();
app.search(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Create user account EmailandPassword
router.post("/signup", async (request, response) => {
    const auth = getAuth();
    try {
      if (!request.body.email || !request.body.password) {
        return response.status(500).send("all field required");
      } else {
        const email = request.body.email;
        const password = request.body.password;
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,password
        );
        const user =  userCredential.user;
        // Send a response to the client indicating that the account was successfully created.
        return response.status(200).send("account successfully created");
      }
    } catch (error) {
      // Catch any errors and send a response to the client indicating that there was an error.
      return response.status(500).send(`${error.message}`);
    }
  });
  
  //Sign in account EmailandPassword
  router.post("/signin", async (request,response) => {
    const email = request.body.email;
    const password = request.body.password;
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
          return response.status(200).send(user);
        
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        return response.status(500).send(error.message);
      });
  });

  export default router;