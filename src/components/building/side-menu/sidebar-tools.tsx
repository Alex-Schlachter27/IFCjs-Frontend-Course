import MapIcon from "@mui/icons-material/Map";
import LogoutIcon from "@mui/icons-material/Logout";
import ErrorIcon from "@mui/icons-material/GppMaybe";
import FloorplanIcon from "@mui/icons-material/FindInPage";
import ModelsIcon from "@mui/icons-material/HolidayVillage";
import ListIcon from "@mui/icons-material/ViewList";
import DeleteIcon from "@mui/icons-material/Delete";
import PropertiesIcon from "@mui/icons-material/Info";
import { Tool } from "../../../types";

export function getSidebarTools(): Tool[] {
  return [
    {
      name: "Info",
      active: false,
      icon: <ListIcon />,
      action: ({ onToggleMenu }) => {
        onToggleMenu(true, "BuildingInfo");
      },
    },
    {
      name: "Models",
      active: false,
      icon: <ModelsIcon />,
      action: ({ onToggleMenu }) => {
        onToggleMenu(true, "ModelList");
      },
    },
    {
      name: "Floorplans",
      active: false,
      icon: <FloorplanIcon />,
      action: ({ onToggleMenu }) => {
        onToggleMenu(true, "Floorplans");
      },
    },
    {
      name: "Properties",
      active: false,
      icon: <PropertiesIcon />,
      action: ({ onToggleMenu }) => {
        onToggleMenu(true, "Properties");
      },
    },
    {
      name: "Issues",
      active: false,
      icon: <ErrorIcon />,
      action: () => {
        console.log("Issues!");
      },
    },
    {
      name: "Map",
      active: false,
      icon: <MapIcon />,
      action: ({ dispatch }) => {
        dispatch({ type: "CLOSE_BUILDING" });
      },
    },
    {
      name: "Delete building",
      active: false,
      icon: <DeleteIcon />,
      action: ({ dispatch, state }) => {
        dispatch({ type: "DELETE_BUILDING", payload: state.building });
      },
    },
    {
      name: "Log out",
      active: false,
      icon: <LogoutIcon />,
      action: ({ dispatch }) => {
        dispatch({ type: "LOGOUT" });
      },
    },
  ];
}
