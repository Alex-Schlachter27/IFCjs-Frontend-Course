import * as OBC from "openbim-components";
import * as THREE from "three";
import { downloadZip } from "client-zip";
import { BuildingDatabase } from "./building-database";
import { Building, PropertySet } from "../../types";
import { unzip } from "unzipit";
import { Floorplan, Property } from "./../../types";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Events } from "../../middleware/event-handler";
import { propertiesService } from "./property-service";

export interface HlSettings {
  enabled: boolean;
  translucent: boolean;
  singleSelect: boolean;
}

export class BuildingScene {
  database = new BuildingDatabase();

  private floorplans: Floorplan[] = [];
  
  private components: OBC.Components;
  private fragments: OBC.Fragments;
  private renderer: OBC.PostproductionRenderer;

  private loadedModels = new Set<string>();
  private whiteMaterial = new THREE.MeshBasicMaterial({ color: "white" });
  private properties: { [fragID: string]: any } = {};
  private _props = propertiesService;

  private sceneEvents: { name: any; action: any }[] = [];  
  private events: Events;

  // CAMERA
  private cameraIsRotating: boolean = false;

  // HIGHLIGHT
  private hlSettings: HlSettings= {
    enabled: true,
    translucent: false,
    singleSelect: true,
  };

  get container() {
    const domElement = this.components.renderer.get().domElement; // canvas of three.js
    // to get the div element, we need to get the parent of the canvas as three.js creates the canvas inside the div element
    return domElement.parentElement as HTMLDivElement;
  }

  constructor(
      container: HTMLDivElement, 
      building: Building, 
      events: Events,
  ){
    this.events = events;
    this.components = new OBC.Components();

    this.components.scene = new OBC.SimpleScene(this.components);
    // this.components.renderer = new OBC.SimpleRenderer(
    //   this.components,
    //   container
    // );

    const scene = this.components.scene.get();
    scene.background = new THREE.Color();

    // Renderer
    this.renderer = new OBC.PostproductionRenderer(this.components, container);
    this.components.renderer = this.renderer;
    this.renderer.postproduction.outlineColor = 0x999999;

    // CAMERA
    const camera = new OBC.OrthoPerspectiveCamera(this.components);
    this.components.camera = camera;
    this.renderer.postproduction.setup(camera.controls);
	  this.renderer.postproduction.active = true;

    const cameraControls = camera.controls;
    cameraControls.addEventListener('update', () => {
      // console.log("CAMERA IS ROTATING")
      this.cameraIsRotating = true;
    });

    cameraControls.addEventListener('sleep', () => {
      // console.log("CAMERA IS SLEEPING")
      this.cameraIsRotating = false;
    });
    

    this.components.raycaster = new OBC.SimpleRaycaster(this.components);
    this.components.init();
    
    // Dimension
    const dimensions = new OBC.SimpleDimensions(this.components);
    this.components.tools.add(dimensions);

    // Clipper
    const clipper = new OBC.EdgesClipper(this.components, OBC.EdgesPlane);
    this.components.tools.add(clipper);

    // Floor plan + Clipper
    const thinLineMaterial = new LineMaterial({
      color: 0x000000,
      linewidth: 0.001,
    });
    clipper.styles.create("thin_lines", [], thinLineMaterial);
    const floorNav = new OBC.PlanNavigator(clipper, camera);
    this.components.tools.add(floorNav);

    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(5, 10, 3);
    directionalLight.intensity = 0.5;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight();
    ambientLight.intensity = 0.5;
    scene.add(ambientLight);

    const grid = new OBC.SimpleGrid(this.components);
    this.components.tools.add(grid);
    this.renderer.postproduction.excludedItems.add(grid.get());

    this.fragments = new OBC.Fragments(this.components);
    this.fragments.highlighter.active = true;

    // Colours: 0x1976d2, yellow
    const selectMat = new THREE.MeshBasicMaterial({ color: 0x1976d2 });
    const preselectMat = new THREE.MeshBasicMaterial({
      color: 0x1976d2,
      opacity: 0.5,
      transparent: true,
    });

    const redMaterial = new THREE.MeshBasicMaterial({ color: "red" });

    this.fragments.highlighter.add("selection", [selectMat]);
    this.fragments.highlighter.add("preselection", [preselectMat]);
    this.fragments.highlighter.add("red", [redMaterial]);

    // If everything should be displayed at once
    // this.fragments.culler.enabled = false;
 
    this.setupEvents();

    this.loadAllModels(building);
    
    this.fragments.exploder.groupName = "floor";
  }

  dispose() {
    this.properties = {};
    this.toggleEvents(false);
    this.loadedModels.clear();
    this.components.dispose();
    this.fragments.dispose();
    this.whiteMaterial.dispose();
    (this.components as any) = null;
    (this.fragments as any) = null;
  }

  private setupEvents() {
    this.sceneEvents = [
      { name: "mousemove", action: this.preselect },
      { name: "click", action: this.select },
      { name: "mouseup", action: this.updateCulling },
      { name: "wheel", action: this.updateCulling },
      { name: "keydown", action: this.createClippingPlane },
      { name: "keydown", action: this.createDimension },
      { name: "keydown", action: this.deleteClippingPlaneOrDimension },
      { name: "keydown", action: this.getIntersection },
      { name: "keydown", action: this.highlightAllWindows },
      { name: "keydown", action: this.escapeAll },
      // { name: "mouseup", action: this.cameraRotation },
      // { name: "mousedown", action: this.cameraRotation },

    ];
    this.toggleEvents(true);
  }

  private toggleEvents(active: boolean) {
    console.log(this.sceneEvents)
    for (const event of this.sceneEvents) {
      if (active) {
        window.addEventListener(event.name, event.action);
      } else {
        window.removeEventListener(event.name, event.action);
      }
    }
  }

  private escapeAll = (event: KeyboardEvent) => {
    if (event.code === "Escape") this.fragments.highlighter.clear()
  }


  // Need to be arrow functions!
  private updateCulling = () => {
    this.fragments.culler.needsUpdate = true;
    // Bind postproduction update with fragment culler update
    this.fragments.culler.viewUpdated.on(() =>
    setTimeout(() => this.renderer.postproduction.update(), 300)
  );
  };

  // private cameraRotation = () => {
  //   setTimeout(() => {
  //     console.log("CAMERA IS NOT ROTATING")
  //     this.cameraIsRotating = false;
  //   }, 1000);
    
  // };

  private preselect = () => {
    if(this.cameraIsRotating) return;
    this.fragments.highlighter.highlight("preselection");
  };

  private select = (event: KeyboardEvent) => {
    // console.log("SELECCTION! Camera is rotating?", this.cameraIsRotating)
    if(this.cameraIsRotating) return;

    // Single select or multiple?
    this.hlSettings.singleSelect = !event.ctrlKey;

    const result = this.fragments.highlighter.highlight("selection", this.hlSettings.singleSelect);
    if (result) {
      console.log(result)

      // TODO
      // Disable selection when turning camera OR 
      // only get properties when checking properties, not with every select (selecting and clicking on menu "Properties")
      //

      // console.log(this.properties[result.fragment.id])
      // const { allSingleValueProps, allPsets, allQsets, allPsetsRels, otherProperties } = this.properties[result.fragment.id];
      const properties = this.properties[result.fragment.id];
      
      // Object Props
      const objectProps = properties[result.id];
      console.log(objectProps)

      // PsetProps
      const pSetProps = this._props.getAllElementProperties(result.id, properties);
      console.log(pSetProps)

      if (objectProps) {
        let displayProps: PropertySet[] = [];
        const formatted: Property[] = [];
        for (const name in objectProps) {
          let value = objectProps[name];
          if (!value) value = "Unknown";
          if (value.value) value = value.value;
          if (typeof value === "number") value = value.toString();
          formatted.push({ name, value });
        }
        // console.log(formatted)
        displayProps.push({name: "Object_Properties", properties: formatted})

        if (pSetProps) {
          // Loop over object of property sets
          for (const pSetName in pSetProps) {
            let formattedPsetProps: Property[] = [];
            let pSet = pSetProps[pSetName];
            // console.log(pSetName)
            for (const prop of pSet) {
              // console.log(prop)
              const name = prop.Name.value ? prop.Name.value : "Unknown";
              // console.log(prop)
              let value: any = "Unknown";
              if (prop.NominalValue != null) {
                value = prop.NominalValue.value ? prop.NominalValue.value : "Unknown";
                if (typeof value === "number") value = value.toString();
              }
              formattedPsetProps.push({ name, value })
            }
            displayProps.push({name: pSetName, properties: formattedPsetProps})
          }
        }

        return this.events.trigger({
          type: "UPDATE_PROPERTIES",
          payload: displayProps,
        });
      }
    }
    this.events.trigger({ type: "UPDATE_PROPERTIES", payload: [] });
  };

  explode(active: boolean) {
    const exploder = this.fragments.exploder;
    if (active) {
      console.log("exploder active")
      console.log(exploder)
      exploder.explode();
    } else {
      exploder.reset();
    }
  }

  toggleClippingPlanes(active: boolean) {
    const clipper = this.getClipper();
    console.log(clipper)
    if (clipper) {
      clipper.enabled = active;
    }
  }

  toggleDimensions(active: boolean) {
    const dimensions = this.getDimensions();
    if (dimensions) {
      dimensions.enabled = active;
    }
  }

  toggleFloorplan(active: boolean, floorplan?: Floorplan) {
    const floorNav = this.getFloorNav();
    if (!this.floorplans.length) return;
    if (active && floorplan) {
      this.toggleGrid(false);
      this.toggleEdges(true);
      floorNav.goTo(floorplan.id);
      this.fragments.materials.apply(this.whiteMaterial);
    } else {
      this.toggleGrid(true);
      this.toggleEdges(false);
      this.fragments.materials.reset();
      floorNav.exitPlanView();
    }
  }

  private createClippingPlane = (event: KeyboardEvent) => {
    // console.log(event.code)
    if (event.code === "KeyP") {
      const clipper = this.getClipper();
      if (clipper) {
        clipper.create();
      }
    }
  };

  private getIntersection = (event: KeyboardEvent) => {
    if (event.code === "KeyI") {
      const firstE = "";
      const secondE = "";
    
      // const props = this.fragments.properties.get("9304F8A1-1962-4481-AA2A-5655ADEA8082i", "22620", true);
      // console.log(props)
      // console.log(this.fragments.groups.setVisibility("category", "IFCSLAB", false))
      console.log(this.fragments.groups.groupSystems)
      console.log(this.fragments.meshes)
      // console.log(this.fragments.tree.generate())
      // console.log(this.fragments.tree)
      // console.log(this.components.tools.tools)
      
    }
  };

  private highlightAllWindows = (event: KeyboardEvent) => {
    if (event.code === "KeyW") {
      const windows = this.fragments.groups.groupSystems.category["IFCWINDOW"];
      console.log(windows)
      this.fragments.highlighter.highlightByID("red", windows, true);
    }
  };

  private createDimension = (event: KeyboardEvent) => {
    if (event.code === "KeyD") {
      const dims = this.getDimensions();
      if (dims) {
        dims.create();
      }
    }
  };

  private toggleGrid(visible: boolean) {
    const grid = this.components.tools.get("SimpleGrid") as OBC.SimpleGrid;
    const mesh = grid.get();
    mesh.visible = visible;
  }

  private getClipper() {
    return this.components.tools.get("EdgesClipper") as OBC.EdgesClipper;
  }

  private getDimensions() {
    return this.components.tools.get(
      "SimpleDimensions"
    ) as OBC.SimpleDimensions;
  }

  private deleteClippingPlaneOrDimension = (event: KeyboardEvent) => {
    if (event.code === "Delete") {
      const dims = this.getDimensions();
      dims.delete();
      const clipper = this.getClipper();
      clipper.delete();
    }
  };

  private getFloorNav() {
    return this.components.tools.get("PlanNavigator") as OBC.PlanNavigator;
  }

  private toggleEdges(visible: boolean) {
    const edges = Object.values(this.fragments.edges.edgesList);
    console.log(edges)
    const scene = this.components.scene.get();
    for (const edge of edges) {
      if (visible) scene.add(edge);
      else edge.removeFromParent();
    }
  }


  async convertIfcToFragments(ifc: File) {
    let fragments = new OBC.Fragments(this.components);

    fragments.ifcLoader.settings.optionalCategories.length = 0;

    fragments.ifcLoader.settings.wasm = {
      path: "../../",
      absolute: false,
    };

    fragments.ifcLoader.settings.webIfc = {
      COORDINATE_TO_ORIGIN: true,
      USE_FAST_BOOLS: true,
    };

    const url = URL.createObjectURL(ifc) as any;
    const model = await fragments.ifcLoader.load(url);
    const file = await this.serializeFragments(model);

    fragments.dispose();
    (fragments as any) = null;

    return file as File;
  }

  private async serializeFragments(model: OBC.FragmentGroup) {
    const files = [];
    for (const frag of model.fragments) {
      const file = await frag.export();
      files.push(file.geometry, file.data);
    }

    files.push(new File([JSON.stringify(model.properties)], "properties.json"));
    files.push(
      new File(
        [JSON.stringify(model.levelRelationships)],
        "levels-relationship.json"
      )
    );
    files.push(new File([JSON.stringify(model.itemTypes)], "model-types.json"));
    files.push(new File([JSON.stringify(model.allTypes)], "all-types.json"));
    files.push(
      new File(
        [JSON.stringify(model.floorsProperties)],
        "levels-properties.json"
      )
    );
    files.push(
      new File(
        [JSON.stringify(model.coordinationMatrix)],
        " .json"
      )
    );
    files.push(
      new File(
        [JSON.stringify(model.expressIDFragmentIDMap)],
        "express-fragment-map.json"
      )
    );

    return downloadZip(files).blob();
  }

  private async loadAllModels(building: Building) {
    console.time("modelLoading")
    const buildingsURLs = await this.database.getModels(building);

    for (const model of buildingsURLs) {
      const { url, id } = model;

      if (this.loadedModels.has(id)) {
        continue;
      }

      this.loadedModels.add(id);

      const { entries } = await unzip(url);

      const fileNames = Object.keys(entries);
      // console.log(fileNames)

      const properties = await entries["properties.json"].json();
      const allTypes = await entries["all-types.json"].json();
      const modelTypes = await entries["model-types.json"].json();
      const levelsProperties = await entries["levels-properties.json"].json();
      const levelsRelationship = await entries["levels-relationship.json"].json();
      const fragmentMap = await entries['express-fragment-map.json'].json();
      const coordinationMatrix = await entries['coordination-matrix.json'].json();

      // Set up floorplans

      const levelOffset = 1.5;
      const floorNav = this.getFloorNav();

      if (this.floorplans.length === 0) {
        for (const levelProps of levelsProperties) {
          const elevation = levelProps.SceneHeight + levelOffset;

          this.floorplans.push({
            id: levelProps.expressID,
            name: levelProps.Name.value,
          });

          // Create floorplan
          await floorNav.create({
            id: levelProps.expressID,
            ortho: true,
            normal: new THREE.Vector3(0, -1, 0),
            point: new THREE.Vector3(0, elevation, 0),
          });
        }

        this.events.trigger({
          type: "UPDATE_FLOORPLANS",
          payload: this.floorplans,
        });
      }

      // Load all the fragments within this zip file
      for (let i = 0; i < fileNames.length; i++) {
        const name = fileNames[i];
        if (!name.includes(".glb")) continue;

        const geometryName = fileNames[i];
        const geometry = await entries[geometryName].blob();
        const geometryURL = URL.createObjectURL(geometry);

        const dataName =
          geometryName.substring(0, geometryName.indexOf(".glb")) + ".json";
        const data = await entries[dataName].json();
        const dataBlob = await entries[dataName].blob();

        const dataURL = URL.createObjectURL(dataBlob);

        const fragment = await this.fragments.load(geometryURL, dataURL);

        // TAKES TOO LONG!
        // const psetPropertyList = this._props.getElementProperties(properties);
        // const newProps = this._props.getFramentProperties(properties, psetPropertyList, fragment);
        // console.log(fragment)

        // Assign properties (to variable and to fragments)
        this.properties[fragment.id] = properties;
        this.fragments.properties.properties[fragment.id] = properties;

        // Generate Spatial tree
        // this.fragments.tree.generate(fragment.id)

        // console.log(fragment.id, Object.keys(properties).length) //--> Always all properties are appended to each fragment property list (to relate it to one model) --> Can be improved!
        // this.properties[fragment.id] = this._props.groupPropertiesByType(properties); //--> Takes way too long!


        // Set up edges
        const lines = this.fragments.edges.generate(fragment);
        lines.removeFromParent();

        // Set up clipping edges
        const styles = this.getClipper().styles.get();
        const thinStyle = styles["thin_lines"];
        thinStyle.meshes.push(fragment.mesh);

        // Group fragments by model
        // const groups = { model: {} as any };
        // groups.model[id] = [];
        // this.fragments.groups.add(fragment.id, groups);
        // console.log(groups)

        // Group items by category and by floor

        const groups = { category: {}, floor: {} } as any;

        const floorNames = {} as any;
        for (const levelProps of levelsProperties) {
          floorNames[levelProps.expressID] = levelProps.Name.value;
        }

        for (const id of data.ids) {
          // Get the category of the items

          const categoryExpressID = modelTypes[id];
          const category = allTypes[categoryExpressID];
          if (!groups.category[category]) {
            groups.category[category] = [];
          }

          groups.category[category].push(id);

          // Get the floors of the items

          const floorExpressID = levelsRelationship[id];
          const floor = floorNames[floorExpressID];
          if (!groups["floor"][floor]) {
            groups["floor"][floor] = [];
          }
          groups["floor"][floor].push(id);
        }

        this.fragments.groups.add(fragment.id, groups);
      }
      console.log(`Model (id: ${id}) loaded into scene`);
    }
    console.timeEnd("modelLoading");
    
    // Update highlighter to work
    this.fragments.culler.needsUpdate = true;
    this.fragments.highlighter.update();
    this.fragments.highlighter.active = true;
  }
}
