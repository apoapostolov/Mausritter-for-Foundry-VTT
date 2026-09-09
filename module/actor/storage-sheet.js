import { MausritterActorSheet } from "./actor-sheet.js";

export class MausritterStorageSheet extends MausritterActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["storage"],
    position: { width: 475, height: 500 },
    window: { resizable: false }
  };

  static PARTS = {
    body: { template: "systems/mausritter/templates/actor/storage-sheet.html" }
  };

  static TABS = {
    primary: {
      tabs: [
        { id: "storage", label: "Maus.Storage" },
        { id: "notes", label: "Maus.Notes" },
        { id: "options", label: "Maus.Options" }
      ],
      initial: "storage"
    }
  };

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const size = data.system.size;
    data.system.storeDiv = "";
    data.system.size.divWidth = size.width * 130 + 35;
    data.system.size.divHeight = size.height * 130 + 35;
    let storenum = 0;
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.width; x++) {
        storenum++;
        data.system.storeDiv +=
          '<div class="item-slot-dashed" style="transform: translate3d('
          + (x * 130 - (size.width - 1) * 65)
          + "px, "
          + (y * 130 - (size.height - 1) * 65)
          + 'px, 0px);"><div class="item-bag-text">'
          + storenum
          + "</div></div>";
      }
    }
    return data;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const size = this.actor.system.size;
    this.setPosition({
      width: size.width * 130 + 80,
      height: size.height * 130 + 230
    });
  }
}
