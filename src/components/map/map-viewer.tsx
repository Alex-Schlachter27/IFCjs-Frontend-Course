import { FC, useRef, useEffect, useState } from "react";
import { LogOutButton } from "../user/logout-button";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../../middleware/context-provider";
import { Button, IconButton } from "@mui/material";
import "./map-viewer.css";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Tooltip from '@mui/material/Tooltip';

export const MapViewer: FC = () => {
  const [state, dispatch] = useAppContext();
  const containerRef = useRef(null);
  const thumbnailRef = useRef(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user, building } = state;

  const onToggleCreate = () => {
    setIsCreating(!isCreating);
  };

  const onCreate = () => {
    if (isCreating) {
      dispatch({ type: "ADD_BUILDING", payload: user });
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container && user) {
      const thumbnail = thumbnailRef.current;
      dispatch({ type: "START_MAP", payload: { container, user, thumbnail } });
    }
  }, []);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (building) {
    const url = `/building/?id=${building.uid}`;
    return <Navigate to={url} />;
  }

  return (
    <>
      <div
        className="full-screen"
        onContextMenu={onCreate}
        ref={containerRef}
      />
      {isCreating && (
        <div className="overlay">
          <p>Right click to create a new building or</p>
          <Button onClick={onToggleCreate}>cancel</Button>
        </div>
      )}
      <div className="button-row">
        <Tooltip title="Create new building">
          {/* , background: "lightgreen"  */}
          <Button onClick={onToggleCreate} variant="contained" aria-label="Create new building" sx={ { borderRadius: 28} }>
            <AddCircleOutlineIcon />
          </Button >
        </Tooltip>
        <LogOutButton />
      </div>
    </>
  );
};
