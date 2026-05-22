import app from "./app.js";
import config from "./config/index.js";
import { initDB } from "./db/index.js";

const port = config.port;
const main = () => {
  initDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

main();
