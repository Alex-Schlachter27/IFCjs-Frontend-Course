import ExplodeIcon from "@mui/icons-material/ImportExport";
import CutIcon from "@mui/icons-material/ContentCut";
import RulerIcon from "@mui/icons-material/Straighten";
import { Tool } from "../../../types";

export function getBottombarTools(): Tool[] {
  const tools = [
    {
      name: "Clipping planes",
      tooltip: "Dimensioning Tool (Key 'P')",
      icon: <CutIcon />,
      active: false,
      action: (dispatch: any) => {
        const tool = findTool("Clipping planes");
        console.log("Clipping plane mode")
        deactivateAllTools(dispatch, "Clipping planes");
        tool.active = !tool.active;
        dispatch({ type: "TOGGLE_CLIPPER", payload: tool.active });
      },
    },
    {
      name: "Dimensions",
      tooltip: "Dimensioning Tool (Key 'D')",
      icon: <RulerIcon />,
      active: false,
      action: (dispatch: any) => {
        const tool = findTool("Dimensions");
        console.log("Dimensioning mode")
        deactivateAllTools(dispatch, "Dimensions");
        tool.active = !tool.active;
        dispatch({ type: "TOGGLE_DIMENSIONS", payload: tool.active });
      },
    },
    {
      name: "Explosion",
      tooltip: "Explosion by floors",
      icon: <ExplodeIcon />,
      active: false,
      action: (dispatch: any) => {
        const tool = findTool("Explosion");
        console.log("Exploding model mode")
        deactivateAllTools(dispatch, "Explosion");
        tool.active = !tool.active;
        dispatch({ type: "EXPLODE_MODEL", payload: tool.active });
      },
    },
  ];

  const findTool = (name: string) => {
    const tool = tools.find((tool) => tool.name === name);
    if (!tool) throw new Error("Tool not found!");
    return tool;
  };

  const deactivateAllTools = (dispatch: any, name: string) => {
    for (const tool of tools) {
      if (tool.active && tool.name !== name) {
        tool.action(dispatch);
      }
    }
  };

  return tools;
}
