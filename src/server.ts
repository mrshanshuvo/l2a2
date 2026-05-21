import app from "./app.ts";
import config from "./config/index.ts";
import { initDB } from "./db/index.ts";

const port = config.port;
const main = () => {
  initDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

main();
