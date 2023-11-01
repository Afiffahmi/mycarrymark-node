import express from "express";
import mcmRoute from "./src/mcmRoute.js";
import authRoute from "./src/authRoute.js";
import cors from 'cors';
import classRoute from "./src/classRoute.js"

const port = 5555;
const app = express();
app.use(cors());
app.search(express.json());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use("/carrymark", mcmRoute);
app.use("/auth", authRoute);
app.use("/class",classRoute);

app.get("/", (request, response) => {
  return response.status(200).send("Hi, there!, nice to meet you.");
});

app.listen(port, () => {
  console.log(`we re listening on port ${port}`);
});

export default app



