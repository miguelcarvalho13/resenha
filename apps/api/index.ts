import express, { Router, Request, Response } from "express";
import { TEST_CONSTANT } from "~common/src/main";

const app = express();
const route = Router();
const port = 3000;

route.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!" + TEST_CONSTANT);
});

app.use(route);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
