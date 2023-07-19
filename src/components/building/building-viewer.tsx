import { FC, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { BuildingTopbar } from "./side-menu/building-topbar";
import { CssBaseline } from "@mui/material";
import { BuildingDrawer } from "./side-menu/building-drawer";
import { getDrawerHeader } from "./mui-utils";
import { useAppContext, getLocalStorageUser, getLocalStorageBuilding } from "../../middleware/context-provider";
import { Navigate } from "react-router-dom";
import { BuildingFrontMenu } from "./front-menu/building-front-menu";
import { FrontMenuMode } from "./front-menu/types";
import { BuildingViewport } from "./building-viewport/building-viewport";
import { BuildingBottomMenu } from "./bottom-menu/building-bottom-menu";

export const BuildingViewer: FC = () => {
  const [width] = useState(240);
  const [sideOpen, setSideOpen] = useState(false);
  const [frontOpen, setFrontOpen] = useState(false);
  const [frontMenuMode, setFrontMenuMode] = useState<FrontMenuMode>("BuildingInfo");

  let [{ building, user }, dispatch] = useAppContext();

  useEffect(() => {
    if (!building) {
      console.log("no building", building)
      // try to get building from local storage 
      building = getLocalStorageBuilding(); 
      console.log(building)
      // trigger on component mount
      dispatch({ type: "OPEN_BUILDING", payload: building });
    }
  }, []);

  
  
  console.log(building)

  // This is executed before useEffect is executed. --> Then goes back to building through the map viewer, where the building is received from the state
  // Need to start the building viewer now!
  if(!building) return <Navigate to="/map" />;
    

  if (!user) {
    console.log("no user", user)
    // try to get user from local storage 
    user = getLocalStorageUser();
    // console.log(user)
    if(!user) return <Navigate to="/login" />;
  }

  const toggleFrontMenu = (active = !frontOpen, mode?: FrontMenuMode) => {
    if (mode) {
      setFrontMenuMode(mode);
    }
    setFrontOpen(active);
  };

  const toggleDrawer = (active: boolean) => {
    setSideOpen(active);
  };

  const DrawerHeader = getDrawerHeader();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <BuildingTopbar
        width={width}
        open={sideOpen}
        onOpen={() => toggleDrawer(true)}
      />

      <BuildingDrawer
        width={width}
        open={sideOpen}
        onClose={() => toggleDrawer(false)}
        onToggleMenu={toggleFrontMenu}
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />

        <BuildingFrontMenu
          onToggleMenu={toggleFrontMenu}
          open={frontOpen}
          mode={frontMenuMode}
        />

        <BuildingViewport />

        
        <BuildingBottomMenu />
      </Box>
    </Box>
  );
};
