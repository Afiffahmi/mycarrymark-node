import express, { request, response } from "express";
import { db } from "./firebase.js";
import {
  doc,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc
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
        const studRef = await addDoc(collection(db,`class/${docRef._key.path.segments[1]}/student`),{

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

//get class by id
router.get("/:id", async (request, response) => {
  try {
    const id = request.params.id;
    const classRef = doc(db, `class/${id}`); 
    const classSnapshot = await getDoc(classRef); 
    const shortId  = classSnapshot.id.slice(0,5) ;

    let classData = {
      shortId: shortId,
      id: classSnapshot.id,
      ...classSnapshot.data(),
    };

    const lecturerSnapshot = await getDocs(collection(db, `class/${id}/lecturer`));
    let lecturers = [];
    lecturerSnapshot.forEach((lecDoc) => {
      lecturers.push({
        id: lecDoc.id,
        ...lecDoc.data(),
      });
    });

    classData.lecturers = lecturers;

    return response.status(200).send(classData);
  } catch (error) {
    return response.status(500).send(`${error}`);
  }
})

//get student list
router.get("/:id/student", async (request, response) => {
  try {
    const id = request.params.id;
    const studentSnapshot = await getDocs(collection(db, `class/${id}/student`));
    let students = [];
    studentSnapshot.forEach((studDoc) => {
      students.push({
        id: studDoc.id,
        ...studDoc.data(),
      });
    });
    return response.status(200).send(students);
  } catch (error) {
    return response.status(500).send(`${error}`);
  }
})

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

//setup coursework partition
router.post("/:id/setup", async (request, response) => {
  try{
    const classId = request.params.id;
    const courseworkRef =  await addDoc(collection(db,`class/${classId}/coursework`),{
      coursework: request.body.coursework,
  })
    return response.status(200).send({message: "successfully setup coursework"});
  }catch(e)
  {
    return response.status(500).send({message: e});
  }
})


export default router;


