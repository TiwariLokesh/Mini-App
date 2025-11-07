import "./db.js";

import { config } from "./config.js";
import { createApp } from "./server.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
