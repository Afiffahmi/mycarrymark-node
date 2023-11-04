import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {storage} from './firebase.js'; 
import multer from "multer";
import { getDownloadURL,uploadBytesResumable,ref } from "firebase/storage";

const app = express();
const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});
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

          return response.status(200).send(auth.currentUser);
        
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        return response.status(500).send(error.message);
      });
  });


  //update user profile
  router.post("/updateprofile", async (request,response) => {
    const auth = getAuth();
    updateProfile(auth, {
      displayName: "Jane Q. User", photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(() => {
      return response.status(200).send("profile updated");
    }).catch((error) => {
      return response.status(500).send(`${error}`);
      // ...
    });
  })

  router.post("/upload", upload.single("filename"),async (req,res)=> {
    try{

      const storageRef = ref(storage,`files/${req.file.originalname}`)

      const metadata = {
        contentType : req.file.mimetype,
      };
      const snapshot = await uploadBytesResumable(storageRef, req.file.buffer,metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("file successfully uploaded")
      return res.send({
        message: 'file uploaded',
        name: req.file.originalname,
        type: req.file.mimetype,
        downloadURL : downloadURL
      })
    }catch(e){
      return res.status(400).send(error.message);
    }
  })



 
  export default router;