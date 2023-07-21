import { FC, useRef, useEffect, useState } from "react";
import { useAppContext } from "../../../middleware/context-provider";
import { Building } from "../../../types";


// export const BuildingViewport: FC <{buildingFromLocalStorage: Building}>= (props) => {
export const BuildingViewport: FC = () => {
  
  // const buildingFromLocalStorage = props.buildingFromLocalStorage;
  
  const [state, dispatch] = useAppContext();
  const containerRef = useRef(null);
  let { user, building } = state;

  useEffect(() => {
    const container = containerRef.current;
    // if(!building) building = buildingFromLocalStorage;
    // console.log(container, building, user)
    if (container && user) {
      dispatch({ type: "START_BUILDING", payload: {container, building} });
    }
  }, []);

  return (
    <>
      <div className="full-screen" ref={containerRef} />
    </>
  );
};