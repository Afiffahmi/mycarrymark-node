import express from "express";
import cors from "cors";
import mcmRoute from "./src/mcmRoute.js"


const port = 3000;
const app = express();
app.set("/carrymark", mcmRoute);

app.get("/", (request, response) => {
  return response.status(200).send("Hi, there!, nice to meet you.");
});

app.search(express.json());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});




