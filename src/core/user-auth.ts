import { Action } from "../middleware/actions";

export const userAuth = {
  login: (action: Action) => {
    console.log(action)
    const name = action.payload.displayName;
    if (name) {
      console.log(`User ${name} logged`);
    }
  },
};
