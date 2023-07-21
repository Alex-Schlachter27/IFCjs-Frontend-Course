import {
  createContext,
  useReducer,
  FC,
  PropsWithChildren,
  useContext,
} from "react";
import { User } from "firebase/auth";
import { Action, ActionList } from "./actions";
import { reducer } from "./state-handler";
import { initialState, State } from "./state";
import { Authenticator } from "./authenticator";
import { executeCore } from "./core-handler";
import { Events } from "./event-handler";
import { Building } from "../types";

const appContext = createContext<[State, React.Dispatch<Action>]>([
  initialState,
  () => {},
]);

export const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useReducer(reducer, initialState);

  const events = new Events();

  const dispatch = (value: Action) => {
    setState(value);
    // console.log(value)
    // localStorage.setItem( storageId, JSON.stringify(value) );
    executeCore(value, events);
  };

  for (const type of ActionList) {
    events.on(type, (payload: any) => {
      const action = { type, payload };
      dispatch(action);
    });
  }

  return (
    <appContext.Provider value={[state, dispatch]}>
      <Authenticator />
      {children}
    </appContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(appContext);
};

export const getLocalStorageUser = () => {
  let user: User | null = null;
  let userString = localStorage.getItem( 'user' ) || undefined;
  if(userString) {
    user = JSON.parse(userString);
  }
  return user;
};

export const setUserLocalStorage = (user: User | null) => {
  // console.log("writing user to local storage", user)
  if(user != null) localStorage.setItem( "user", JSON.stringify(user) );
};

export const getLocalStorageBuilding = () => {
  let building: Building | null = null;
  let buildingString = localStorage.getItem( 'building' ) || undefined;
  if(buildingString) {
    building = JSON.parse(buildingString);
  }
  return building;
};

export const setBuildingLocalStorage = (building: Building | null) => {
  // console.log("writing building to local storage", building)
  if(building != null) localStorage.setItem( "building", JSON.stringify(building) );
};

