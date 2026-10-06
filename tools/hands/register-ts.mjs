// register-ts.mjs — --import entry: enables extensionless .ts resolution.
import { register } from "node:module";
register("./ts-resolve.mjs", import.meta.url);
