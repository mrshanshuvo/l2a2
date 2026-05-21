import app from "./app";
import config from "./config/index";
import { initDB } from "./db/index";

const port = config.port;
const main = () => {
  initDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

main();
