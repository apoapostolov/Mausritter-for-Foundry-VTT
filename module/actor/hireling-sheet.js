import { MausritterActorSheet } from "./actor-sheet.js";

export class MausritterHirelingSheet extends MausritterActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["hireling"],
    position: { width: 680, height: 620 }
  };

  static PARTS = {
    body: { template: "systems/mausritter/templates/actor/hireling-sheet.html" }
  };

  static TABS = {
    primary: {
      tabs: [{ id: "notes", label: "Maus.Notes" }],
      initial: "notes"
    }
  };
}
