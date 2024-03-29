import { FC } from "react";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { BuildingSidebar } from "./building-sidebar";
import { getDrawer, getDrawerHeader } from "../mui-utils";
import { FrontMenuMode } from "../front-menu/types";

export const BuildingDrawer: FC<{
  open: boolean;
  width: number;
  onToggleMenu: (active?: boolean, mode?: FrontMenuMode) => void;
  onClose: () => void;
}> = (props) => {
  const theme = useTheme();

  const { open, width: drawerWidth, onClose, onToggleMenu } = props;

  const Drawer = getDrawer(drawerWidth);
  const DrawerHeader = getDrawerHeader();

  const handleClick = (e: any) => {
    // Prevent the click event from propagating to the three.js scene
    e.stopPropagation();
  };

  return (
    <Drawer variant="permanent" open={open} onClick={handleClick}>
      <DrawerHeader>
        <IconButton onClick={onClose}>
          {theme.direction === "rtl" ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <BuildingSidebar onToggleMenu={onToggleMenu} open={open} />
      <Divider />
    </Drawer>
  );
};
