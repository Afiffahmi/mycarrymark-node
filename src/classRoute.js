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
  getDoc,
  runTransaction,
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



//setup coursework partition
router.post("/:id/setup", async (request, response) => {
  try{
    const classId = request.params.id;
    const courseworkRef =  await addDoc(collection(db,`class/${classId}/coursework`),{
      coursework: request.body.coursework,
  })
    return response.status(200).send({message: "successfully setup coursework",
     code : 200 });
  }catch(e)
  {
    return response.status(500).send({message: e});
  }
})

//get coursework partition

router.get("/:id/coursework", async (request, response) => {
  try{
    const classId = request.params.id;
    const courseworkSnapshot = await getDocs(collection(db, `class/${classId}/coursework`));
    let coursework = [];
    courseworkSnapshot.forEach((cwDoc) => {
      coursework.push({
        id: cwDoc.id,
        ...cwDoc.data(),
      });
    });
    return response.status(200).send(coursework);
  }catch(e)
  {
    return response.status(500).send({message: e});
  }
})

router.post("/:id/forum", async (request, response) => {
  try{
    const classId = request.params.id;
    const forumRef =  await addDoc(collection(db,`class/${classId}/forum`),{

      title: request.body.title,
  })

  if(forumRef){
    const commentRef = await addDoc(collection(db,`class/${classId}/forum/${forumRef._key.path.segments[3]}/messages`),{
      content: request.body.content,
      timestap: new Date().getTime(),
    })

  }
    return response.status(200).send({message: "successfully setup forum",
     code : 200 });
  }catch(e)
  {
    return response.status(500).send({message: e});
  }
})

router.get("/:id/forum", async (request, response) => {
  try {
    const classId = request.params.id;

    // Get the forum data
    const forumSnapshot = await getDocs(collection(db, `class/${classId}/forum`));
    let forums = [];
    let finalforum = [];

    for (let doc of forumSnapshot.docs) {
      let forum = {
        id: doc.id,
        ...doc.data(),
      };

      const messageSnapshot = await getDocs(collection(db, `class/${classId}/forum/${forum.id}/messages`));
      let messages = [];
      messageSnapshot.docs.forEach(messageDoc => {
        messages.push({
          id: messageDoc.id,
          ...messageDoc.data(),
        });
      });

      const userSnapshot = await getDocs(collection(db, `class/${classId}/forum/${forum.id}/users`));
      let users = [];
      userSnapshot.docs.forEach(userDoc => {
        users.push({
          id: userDoc.id,
          ...userDoc.data(),
        });
      });

      finalforum.push({
        id: forum.id,
        sender: forum.sender,
        title: forum.title,
        messages: messages,
        users: users
      });
    }

    return response.status(200).send(finalforum);
  } catch (e) {
    return response.status(500).send({message: e});
  }
});

router.get("/:id/users", async (request, response) => {
  try {
    const classId = request.params.id;

    // Get the forum data
    const forumSnapshot = await getDocs(collection(db, `class/${classId}/forum`));
    let forum = {};
    const forumData = forumSnapshot.docs.map(doc => {
      forum = {
        id: doc.id,
        ...doc.data(),
      };
      
    }
    );
    
    const userSnapshot = await getDocs(collection(db, `class/${classId}/forum/${forum.id}/users`));
    let users= [];
    const usersData = userSnapshot.docs.map(doc => {
      users.push({
        id: doc.id,
          ...doc.data()
      })
    });



    return response.status(200).send(users);
  } catch (e) {
    return response.status(500).send({message: e});
  }
});

//create classwork 
router.post("/:id/classwork", async (request, response) => {
  try{
    const classId = request.params.id;
    const classworkRef =  await addDoc(collection(db,`class/${classId}/classwork`),{
      title: request.body.title,
      description: request.body.description,
      dueDate: request.body.dueDate,
      maxMark: request.body.maxMark,
      type: request.body.type,
      status: "open",
      submitted: 0,
  })
    return response.status(200).send({message: "successfully setup classwork",
     code : 200 });
  }catch(e)
  {
    return response.status(500).send({message: e});
  }
})

//create material
router.post("/:id/material", async (request, response) => {
  try{
    const classId = request.params.id;
    const materialRef =  await addDoc(collection(db,`class/${classId}/material`),{
      title: request.body.title,
      description: request.body.description,
      link: request.body.link,
  })
    return response.status(200).send({message: "successfully setup material",
     code : 200 });
  }catch(e)
  {
    return response.status(500).send({message: e});
  }
})

//update classwork
router.put("/:id/classwork/:classworkId", async (request, response) => {
  try {
    if (!request.body.title || !request.body.description || !request.body.dueDate || !request.body.maxMark || !request.body.type || !request.body.status) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const id = request.params;
    const classworkRef = doc(db, `class/${id.id}/classwork/${id.classworkId}`);

    await updateDoc(classworkRef, {
      title: request.body.title,
      description: request.body.description,
      dueDate: request.body.dueDate,
      maxMark: request.body.maxMark,
      type: request.body.type,
      status: request.body.status,
    });

    return response.status(200).send("successfully updated");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});

//update material
router.put("/:id/material/:materialId", async (request, response) => {
  try {
    if (!request.body.title || !request.body.description || !request.body.link) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const id = request.params;
    const materialRef = doc(db, `class/${id.id}/material/${id.materialId}`);

    await updateDoc(materialRef, {
      title: request.body.title,
      description: request.body.description,
      link: request.body.link,
    });

    return response.status(200).send("successfully updated");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});

//delete classwork
router.delete("/:id/classwork/:classworkId", async (request, response) => {
  try {
    const id = request.params;
    const classworkRef = doc(db, `class/${id.id}/classwork/${id.classworkId}`);
    await deleteDoc(classworkRef);
    return response.status(200).send("successfully deleted");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
}
);

//create student 
router.post("/:id/student", async (request, response) => {
  try {
    const classId = request.params.id;
    const studentRef = await addDoc(collection(db, `class/${classId}/student`), {
      email: request.body.email,
      name: request.body.name,
      studentid: request.body.studentid,
      avatar: request.body.avatar,
      online: false,
    });

    const classRef = doc(db, `class/${classId}`);
    await runTransaction(db, async (transaction) => {
      const classDoc = await transaction.get(classRef);
      const nStudent = classDoc.data().nStudent || 0;
      transaction.update(classRef, { nStudent: nStudent + 1 });
    });

    return response.status(200).send({
      message: "successfully setup student",
      code: 200,
    });
  } catch (e) {
    return response.status(500).send({ message: e });
  }
});

//update student
router.put("/:id/student/:studentId", async (request, response) => {
  try {
    if (!request.body.email || !request.body.name || !request.body.username || !request.body.avatar || !request.body.online) {
      return response.status(400).send({
        message: "send all the required field",
      });
    }
    const id = request.params;
    const studentRef = doc(db, `class/${id.id}/student/${id.studentId}`);

    await updateDoc(studentRef, {
      email: request.body.email,
      name: request.body.name,
      studentid: request.body.studentid,
      avatar: request.body.avatar,
      online: request.body.online,
    });

    return response.status(200).send("successfully updated");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
});

//delete student
router.delete("/:id/student/:studentId", async (request, response) => {
  try {
    const id = request.params;
    const studentRef = doc(db, `class/${id.id}/student/${id.studentId}`);
    await deleteDoc(studentRef);
    return response.status(200).send("successfully deleted");
  } catch (error) {
    return response.status(500).send(`ERROR !?   ${error}`);
  }
}
);

//view grading
router.get("/:id/grading", async (request, response) => {
  try {

    const classId = request.params.id;

    const courseworkSnapshot = await getDocs(collection(db, `class/${classId}/coursework`));
    if (courseworkSnapshot.empty) {
      return response.status(404).send({ message: "Coursework not found" });
    }

    const studentSnapshot = await getDocs(collection(db, `class/${classId}/student`));
    if(studentSnapshot.empty){
      return response.status(404).send({ message: "student not found" });
    }
        let coursework = [];
    courseworkSnapshot.docs.forEach((doc) => {
      coursework.push({
        id: doc.id,
        ...doc.data(),
    });
    });

    let students = [];
    studentSnapshot.docs.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const gradingSnapshot = await getDocs(collection(db, `class/${classId}/grading`));
    let grading = [];
    gradingSnapshot.forEach((gradDoc) => {
      grading.push({
        id: gradDoc.id,
        ...gradDoc.data(),
      });
    });
    return response.status(200).send({grading: grading, coursework: coursework, student: students});
  } catch (error) {
    return response.status(500).send(`${error}`);
  }
})

router.post("/:id/grading", async (request, response) => {
  try {
    const classId = request.params.id;
    const studentId = request.body.studentId;

    // Get the grading collection for the specific class
    const gradingCollection = collection(db, `class/${classId}/grading`);
    const gradingSnapshot = await getDocs(gradingCollection);

    // Check if the studentId already exists in the grading documents
    const gradingExists = gradingSnapshot.docs.some(doc => doc.data().studentId === studentId);

    if (gradingExists) {
      return response.status(400).send({message:"Grading for this student already exists"});
    }

    const gradingRef = await addDoc(gradingCollection, {
      studentId: studentId,
      grades: request.body.grades,
    });

    return response.status(200).send({
      message: "Successfully setup grading",
      code: 200,
    });
  
  } catch (e) {
    console.error(e); // Log the error to the console
    return response.status(500).send({ message: e });
  }
});

//update grading
router.put("/:id/grading", async (request, response) => {
  try {
    const classId = request.params.id;
    const studentId = request.body.studentId;

    // Get the grading collection for the specific class
    const gradingCollection = collection(db, `class/${classId}/grading`);
    const gradingSnapshot = await getDocs(gradingCollection);

    // Find the grading document for the specific student
    const gradingDoc = gradingSnapshot.docs.find(doc => doc.data().studentId === studentId);

    if (gradingDoc) {
      // If the grading document exists, update it with the new grades
      const gradingRef = doc(db, `class/${classId}/grading`, gradingDoc.id);
      await updateDoc(gradingRef, {
        grades: request.body.grades,
      });

      return response.status(200).send({
        message: "Successfully updated grading",
        code: 200,
      });
    } else {
      // If the grading document doesn't exist, send a 400 response
      return response.status(400).send({message:"Grading for this student does not exist"});
    }
  
  } catch (e) {
    console.error(e); // Log the error to the console
    return response.status(500).send({ message: e });
  }
});

router.get("/:id/grading/:studentId", async (request, response) => {
  try {
    const classId = request.params.id;
    const studentId = request.params.studentId;

    // Get the grading collection for the specific class
    const gradingCollection = collection(db, `class/${classId}/grading`);
    const gradingSnapshot = await getDocs(gradingCollection);

    // Find the grading document for the specific student
    const gradingDoc = gradingSnapshot.docs.find(doc => doc.data().studentId === studentId);

    if (gradingDoc) {
      // If the grading document exists, send it as the response
      return response.status(200).send(gradingDoc.data());
    } else {
      // If the grading document doesn't exist, send a 404 response
      return response.status(404).send({message:"Grading for this student does not exist"});
    }
  
  } catch (e) {
    console.error(e); // Log the error to the console
    return response.status(500).send({ message: e });
  }
});


export default router;


