import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { buildIndex } from "../src/lib/rag-index";

buildIndex()
  .then(() => console.log("✓ RAG index built"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
