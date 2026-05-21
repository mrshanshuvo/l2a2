import dotenv from "dotenv";
import path from "path";

dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connectionString: process.env.CONNECTIONSTRING as string,
  port: process.env.PORT,
  access_secret: process.env.JWT_ACCESS_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  access_token_expiration: process.env.JWT_ACCESS_EXPIRATION,
  refresh_token_expiration: process.env.JWT_REFRESH_EXPIRATION,
};

export default config;
