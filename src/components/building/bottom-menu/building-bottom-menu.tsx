import { Card, IconButton, Tooltip } from "@mui/material";
import { FC } from "react";
import "./building-bottom-menu.css";
import { getBottombarTools } from "./bottombar-tools";
import { useAppContext } from "../../../middleware/context-provider";

const tools = getBottombarTools();

export const BuildingBottomMenu: FC = () => {
  const dispatch = useAppContext()[1];  
  // const [state, dispatch] = useAppContext();

  return (
    <Card className="bottom-menu">
      {tools.map((tool) => {
        return (
          <Tooltip key={tool.name} title={tool.tooltip}>
            <IconButton
              color={tool.active ? "primary" : "default"}
              onClick={() => tool.action(dispatch)}
              key={tool.name}
            >
              {tool.icon}
            </IconButton>
          </Tooltip>
        );
      })}
    </Card>
  );
};
