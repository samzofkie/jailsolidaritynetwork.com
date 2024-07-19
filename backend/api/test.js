import { authenticatePassword } from "./utils.js";

new Promise(async (res, _) => {
  res(authenticatePassword('admin', ''));
});
