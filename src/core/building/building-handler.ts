import { BuildingScene } from "./building-scene";

export const buildingHandler = {
  viewer: null as BuildingScene | null,

  async start(container: HTMLDivElement) {
    if (!this.viewer) {
      this.viewer = new BuildingScene(container);
      console.log("Viewer started")
    }
  },

  remove() {
    if (this.viewer) {
      console.log("building disposed!");
      this.viewer.dispose();
      this.viewer = null;
    }
  },
};
