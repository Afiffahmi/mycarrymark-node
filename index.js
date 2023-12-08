import express from "express";
import mcmRoute from "./src/mcmRoute.js";
import authRoute from "./src/authRoute.js";
import cors from 'cors';
import classRoute from "./src/classRoute.js"
import path from 'path';
import {fileURLToPath} from 'url';
import ejs from 'ejs';
import favicon from 'serve-favicon'
import createHttpError from "http-errors";
import {v4} from 'uuid';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const port = 5555;
const app = express();
app.use(cors());
app.search(express.json());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(favicon(path.join(__dirname,'public','favicon.ico')))
app.use("/carrymark", mcmRoute);
app.use("/auth", authRoute);
app.use("/class",classRoute);

app.engine('html',ejs.renderFile);

app.get("/", (request, response) => {
  response.render('index.html')
});


app.get('*', (req, res) => {
  res.send('404 Page Not Found');
});

app.use((req,res,next)=>{
  next(new createHttpError.NotFound());
})


app.listen(port, () => {
  console.log(`we re listening on port ${port}`);
});

export default app;



