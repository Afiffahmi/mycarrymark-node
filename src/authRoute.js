import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  doc,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import {storage,db} from './firebase.js'; 
import multer from "multer";
import { getDownloadURL,uploadBytesResumable,ref, getStorage,listAll} from "firebase/storage";
import path from "path";

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

  router.post("/:id/upload", upload.single("filename"),async (req,res)=> {
    try{
      const user = req.params.id
      const storageRef = ref(storage,`files/user/${user}/${req.file.originalname}`)

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
        downloadURL : downloadURL,
        owner : user
      })
    }catch(e){
      return res.status(500).send(console.log(e));
    }
  })


//get list of files
router.get("/:id/files", async (request, response) => {
  const storage = getStorage();

  try {
    const listRef = ref(storage, `files/user/${request.params.id}`);

    // Find all the prefixes and items.
    listAll(listRef)
      .then(async (res) => {
        let results = [];
        res.prefixes.forEach((folderRef) => {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
          results.push({ type: 'folder', name: folderRef.name });
        });

        // Fetch download URLs for all items
        const itemPromises = res.items.map(async (itemRef) => {
          const downloadURL = await getDownloadURL(itemRef);
          const fileType = path.extname(itemRef.name);
          results.push({ type: fileType , name: itemRef.name, downloadURL : downloadURL });
        });

        // Wait for all download URLs to be fetched
        await Promise.all(itemPromises);

        // Send the results as the response
        return response.status(200).send(results);
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
        return response.status(500).send(error);
      });
  } catch (e) {
    return response.status(500).send(e);
  }
});

router.post("/:id/studentprofile",upload.single("filename") ,async (request, response) => {
  try {
    const profileData = request.body;
    const id = request.params.id;
    const profileRef = doc(db, 'studentprofiles', id);
    const storageRef = ref(storage,`files/user/student/${id}/${request.file.originalname}`)
    const metadata = {
      contentType : request.file.mimetype,
    };
    const snapshot = await uploadBytesResumable(storageRef, request.file.buffer,metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    await setDoc(profileRef, { ...profileData, email: id }, { merge: true });

    const updatedProfileData = await getDoc(profileRef);
    const updatedProfile = {
      avatar: downloadURL,
      online: true,
      id: profileRef.id,
      ...updatedProfileData.data()
    };

    return response.status(200).send(updatedProfile);
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});

router.get("/:id/studentprofile", async (request, response) => {
  try {
    const id = request.params.id;
    const profileRef = doc(db, 'studentprofiles', id);
    const profileData = await getDoc(profileRef);
    if (!profileData.exists()) {
      return response.status(500).send({messages:"Profile not found"});
    }
    const profile = {
      id: profileRef.id,
      ...profileData.data()
    };
    return response.status(200).send(profile);
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});



 
  export default router;