import { Divider } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FC } from "react";
import { useAppContext } from "../../../../middleware/context-provider";
import "./front-menu-content.css";
import React from "react";

export const PropertiesMenu: FC = () => {
  const [state] = useAppContext();
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // console.log(state)
  if(!state.properties) return <></>;

  if(state.properties.length > 0) {
    const propertyList = state.properties;
    const objectProps = state.properties[0];
    console.log(propertyList)
    console.log(objectProps)



    return (
      <div>
        {propertyList.map((pSet) => (

          <Accordion  key={pSet.name} expanded={expanded === pSet.name} onChange={handleChange(pSet.name)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${pSet.name}-content`}
              id={`${pSet.name}-header`}
            >
              <Typography >
                {pSet.name}
              </Typography>
              {/* <Typography sx={{ color: 'text.secondary' }}>I am an accordion</Typography> */}
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
              {pSet.properties.map((property) => (
                <div key={property.name}>
                  <div className="value-pair list-item">
                    <div>{property.name}</div>
                    <span>:</span>
                    <div>{property.value}</div>
                  </div>
                  <Divider />
                </div>
              ))}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    );

    } else {
      return (
        <div>
          <span>No item selected.</span>
        </div>
      );
    }


  // return (
  //   <div>
  //     {Boolean(state.properties.length) ? (
  //       <Divider />
  //     ) : (
  //       <p>No item selected.</p>
  //     )}

  //     {state.properties[0].properties.map((property) => (
  //       <div key={property.name}>
  //         <div className="value-pair list-item">
  //           <div>{property.name}</div>
  //           <p>:</p>
  //           <div>{property.value}</div>
  //         </div>
  //         <Divider />
  //       </div>
  //     ))}
  //   </div>
  // );
};
