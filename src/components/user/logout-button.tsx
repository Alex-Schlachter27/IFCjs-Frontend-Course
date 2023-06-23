import { FC } from "react";
import Button from "@mui/material/Button";
import { useAppContext } from "../../middleware/context-provider";
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';

export const LogOutButton: FC = () => {
  const dispatch = useAppContext()[1];
  const onLogoutClick = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <>
      <Tooltip title="Logout">
        <Button onClick={onLogoutClick} variant="contained" sx={ { borderRadius: 28 } }>
          <LogoutIcon />
        </Button>
      </Tooltip>
      
    </>
  );
};
