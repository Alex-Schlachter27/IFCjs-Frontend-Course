import { Fragment } from "bim-fragment";
import { Property } from "./../../types";

const ifcTypes: any = {
  "IFCQUANTITYSET":2090586900,
  "IFCPROPERTYSINGLEVALUE":3650150729,
  "IFCPROPERTYSET":1451395588,
  "IFCRELDEFINESBYPROPERTIES":4186316022
}

export const propertiesService = {

  groupPropertiesByType(properties: any) {
    // Takes way too long time
    let allSingleValueProps = [];
    let allPsets: { [expressID: string]: any } = {};;
    let allQsets: { [expressID: string]: any } = {};;
    let allPsetsRels: { [expressID: string]: any } = {};;
    let otherProperties: { [expressID: string]: any } = {};

    for (let i = 0; i < Object.entries(properties).length; i++) {
      console.log(i)
      const [key, propValue]: any = Object.entries(properties)[i];
      if(propValue.type === ifcTypes['IFCPROPERTYSET']) allPsets[key] = propValue;
      else if(propValue.type === ifcTypes['IFCRELDEFINESBYPROPERTIES']) allPsetsRels[key] = propValue;
      else if(propValue.type === ifcTypes['IFCPROPERTYSINGLEVALUE']) allSingleValueProps[key] = propValue;
      else if(propValue.type === ifcTypes["IFCQUANTITYSET"]) allQsets[key] = propValue;
      else otherProperties[key] = propValue;
    }
    return {allSingleValueProps, allPsets, allQsets, allPsetsRels, otherProperties}
  },

  getAllElementProperties(expressID: any, properties: any) {
    let psetProps: { [pSetName: string]: any } = {};

    // Find all relations between Psets and elements through PsetRels
    for (let i = 0; i < Object.values(properties).length; i++) {
      const ifcProp: any = Object.values(properties)[i];

      if(ifcProp.type === ifcTypes['IFCRELDEFINESBYPROPERTIES']) {
        const psetRel = ifcProp; 
        // Get pSet  
        const pSetId = psetRel.RelatingPropertyDefinition.value;
        const pSet = properties[pSetId];
        // console.log(pSet)
        const pSetName = pSet.Name.value;
        
        for (let i = 0; i < psetRel.RelatedObjects.length; i++) {
          const relatedObject: any = psetRel.RelatedObjects[i].value;
          // console.log(relatedObject)
          // console.log(expressID)
          // console.log(relatedObject === expressID)

          // Check if the element is related to the Pset
          if(relatedObject.toString() === expressID) {
              // console.log("found property-element match")
              if(!psetProps[pSetName]) {
                psetProps[pSetName] = [];
              }
              // Find all Psets with the property linked to them
              if (pSet.HasProperties) { // Apparently there are also IFCELEMENTQUANTITIES that have Quantities and not HasPRoperties as a property
                for(let propID of pSet.HasProperties) {
                  // console.log(propID)
                  const prop = properties[propID.value];
                  // console.log(prop);
                  psetProps[pSetName].push(prop);
                }
              }
              else if(pSet.Quantities) {
                for(let propID of pSet.Quantities) {
                  // console.log(propID)
                  const prop = properties[propID.value];
                  // console.log(prop);
                  psetProps[pSetName].push(prop);
                }
              }
          }
        
        }
      };
    } 
    return psetProps
  },

  getAllElementPropertiesFromGroupedProperties(expressID: any, allSingleValueProps: any, allPsets: any, allPsetsRels: any) {
    let psetProps: { [pSetName: string]: any } = {};;

    for (let i = 0; i < Object.values(allPsets).length; i++) {
      const pSet: any = Object.values(allPsets)[i];
      const pSetName = pSet.Name.value;

      // Find all relations between Psets and elements
      for (let i = 0; i < Object.values(allPsetsRels).length; i++) {
        const psetRel: any = Object.values(allPsetsRels)[i];
        
        for (let i = 0; i < psetRel.RelatedObjects.length; i++) {
          const relatedObject: any = psetRel.RelatedObjects[i];
          const relPropDef = psetRel.RelatingPropertyDefinition.value;
          // console.log(relatedObject)

          // Check if the element is related to the Pset
          if(relatedObject === expressID) {
              if(!psetProps[pSetName]) {
                psetProps[pSetName] = [];
              }
              // Find all Psets with the property linked to them
              for(let propID of pSet.HasProperties) {
                const prop = allSingleValueProps[propID];
                console.log(prop);
                psetProps[pSetName].push(prop);
            }
          }
        
        }
      }
    }  
    return psetProps
  },


  getPropertiesGroupedByElement(properties: any) {
    let objectProperties: { [expressID: string]: any } = {};
    let pSetProperties: { [expressID: string]: any } = {};
    let propertySets: { [expressID: string]: any } = {};
    let quantitySets: { [expressID: string]: any } = {};
    const propValues = Object.values(properties);
    const allSingleValueProps = [];
    const allPsets = [];
    const allQsets = [];
    const allPsetsRels = [];

    // PropertySets and Quantity Sets
    for (let i = 0; i < propValues.length; i++) {
      const propValue: any = propValues[i];
      // console.log(propValue.type)
      if(propValue.type === ifcTypes['IFCPROPERTYSET']) allPsets.push(propValue);
      if(propValue.type === ifcTypes['IFCRELDEFINESBYPROPERTIES']) allPsetsRels.push(propValue);
      if(propValue.type === ifcTypes['IFCPROPERTYSINGLEVALUE']) {
        allSingleValueProps.push(propValue);
      }
      if(propValue.type === ifcTypes["IFCQUANTITYSET"]) allQsets.push(propValue);
    }

    // Rather go from all Psets to all elements and then get the properties of all elements

    for (let i = 0; i < allSingleValueProps.length; i++) {
      const propValue = allSingleValueProps[i];
      // console.log(propValue)

      // Get related Pset --> get related pSetRels --> get objects
      let relatedObjects: any[] = [];
      let relatedPsets: any[] = [];

      for (let i = 0; i < allPsets.length; i++) {
        const pSet: any = allPsets[i];

        // Find all Psets with the property linked to them
        for(let prop of pSet.HasProperties) {
          if(prop.value == propValue.expressID) {
            const relatedPset = pSet;
            relatedPsets.push(relatedPset)

            // Find all relations between Psets and elements
            for (let i = 0; i < allPsetsRels.length; i++) {
              const psetRel: any = allPsetsRels[i];
              if(psetRel.RelatingPropertyDefinition.value == relatedPset.expressID) {
                
                // console.log(psetRel)
                for (let i = 0; i < psetRel.RelatedObjects.length; i++) {
                  const relatedObject: any = psetRel.RelatedObjects[i];
                  relatedObjects.push(relatedObject.value)
                }
              }
            }
          }
        }
      }  
      // console.log(relatedObjects)

      for (let expressID of relatedObjects) {
        const copiedPropValue = {...propValue}; // OR JSON.parse(JSON.stringify(scheduleProperty))
        if(!pSetProperties[expressID]) {
          pSetProperties[expressID] = [];
        }
        pSetProperties[expressID].push({prop: copiedPropValue, pSet: relatedPsets})
      }
    }
    return pSetProperties;
    
      
  },

  getFramentProperties(properties: any, psetPropertyList: any, fragment: Fragment) {
    let objectProperties: { [expressID: string]: any } = {};
    // console.log(psetPropertyList)

    // Object Properties
    for (let i = 0; i < fragment.items.length; i++) {
      const expressID = fragment.items[i];

      const objectProps = properties[expressID];
      const psetProps = psetPropertyList[expressID]
      // console.log(objectProps)
      objectProperties[expressID] = {objectProps, psetProps}      
    };   
    return objectProperties;
  },

  
  // formatProperties(properties: any) {
  //   const allProps = properties[result.fragment.id];
  //     const props = allProps[result.id];
  //     if (props) {
  //       const formatted: Property[] = [];
  //       for (const name in props) {
  //         let value = props[name];
  //         if (!value) value = "Unknown";
  //         if (value.value) value = value.value;
  //         if (typeof value === "number") value = value.toString();
  //         formatted.push({ name, value });
  //       }
  //       return this.events.trigger({
  //         type: "UPDATE_PROPERTIES",
  //         payload: formatted,
  //       });
  //     }
  // }

  
};
