import { Card, CardContent, IconButton } from "@mui/material";
import { FC } from "react";
import "./building-front-menu.css";
import CloseIcon from "@mui/icons-material/Close";
import { BuildingInfoMenu } from "./front-menu-content/building-info-menu";
import { ModelListMenu } from "./front-menu-content/model-list-menu";
import { FrontMenuMode } from "./types";
import { PropertiesMenu } from "./front-menu-content/properties-menu";
import { FloorplanMenu } from "./front-menu-content/floorplan-menu";

export const BuildingFrontMenu: FC<{
  mode: FrontMenuMode;
  open: boolean;
  onToggleMenu: (active: boolean) => void;
}> = ({ mode, open, onToggleMenu }) => {
  if (!open) {
    return <></>;
  }

  const content = new Map<FrontMenuMode, any>();
  content.set("BuildingInfo", <BuildingInfoMenu onToggleMenu={onToggleMenu} />);
  content.set("ModelList", <ModelListMenu />);
  content.set("Properties", <PropertiesMenu />);
  content.set("Floorplans", <FloorplanMenu />);

  const titles = {
    BuildingInfo: "Building Information",
    ModelList: "Model List",
    Properties: "Properties",
    Floorplans: "Floorplans",
  };

  const handleClick = (e: any) => {
    // Prevent the click event from propagating to the three.js scene
    e.stopPropagation();
  };

  const title = titles[mode];

  return (
    // <div className="popup-wrapper" onClick={handleClick}>
      <Card className="front-menu" onClick={handleClick}>
        <CardContent>
          <div className="front-menu-header">
            <h2>{title}</h2>
            <IconButton onClick={() => onToggleMenu(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div className="front-menu-content">{content.get(mode)}</div>
        </CardContent>
      </Card>
    // </div>
  );
};
