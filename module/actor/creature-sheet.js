import { MausritterActorSheet } from "./actor-sheet.js";

export class MausritterCreatureSheet extends MausritterActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["creature"],
    position: { width: 680, height: 620 }
  };

  static PARTS = {
    body: { template: "systems/mausritter/templates/actor/creature-sheet.html" }
  };

  static TABS = {
    primary: {
      tabs: [{ id: "notes", label: "Maus.Notes" }],
      initial: "notes"
    }
  };
}
