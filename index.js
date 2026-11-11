import express from "express";

import bootstrap from "./src/app.controller.js";
import { PORT } from "./config/config.service.js";
import chalk from "chalk";

const app = express();
const port = PORT || 80;

bootstrap(app, express);

app.listen(port, () => {
  console.log(chalk.bgBlue(`Server is running on port ${port}!`));
});
