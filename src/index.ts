import express, { Application } from "express";
import appConfig from "./app";
import { dbConfig, environmentVariable } from "./config";

const app: Application = express();

process.on("uncaughtException", (err: Error) => {
  console.log(`UncaughtException, server shutting down`);
  console.log(err.name, err.message);
  process.exit(1);
});

//initialize DB connection
dbConfig();
// initialize application
appConfig(app);

const port = environmentVariable.PORT;
const server = app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

process.on("unhandledRejection", (reason: Error | any) => {
  console.log(`UnhandledRejection, server is shutting down`);
  console.log(reason.message, reason);
  server.close(() => {
    process.exit(1);
  });
});
