import { MausritterActor } from "./actor/actor.js";
import { MausritterActorSheet } from "./actor/actor-sheet.js";
import { MausritterHirelingSheet } from "./actor/hireling-sheet.js";
import { MausritterCreatureSheet } from "./actor/creature-sheet.js";
import { MausritterStorageSheet } from "./actor/storage-sheet.js";

import { MausritterItem } from "./item/item.js";
import { MausritterItemSheet } from "./item/item-sheet.js";

import { registerSettings } from "./settings.js";
import { autoCreateCharacter } from "./actor/create-character/create-character.js";
import { patchRollTableChat, postTableCard } from "./chat/table-card.js";
import {
  CharacterData,
  HirelingData,
  CreatureData,
  StorageActorData,
  GearData,
  WeaponData,
  ArmorData,
  StorageItemData,
  ConditionData,
  SpellData
} from "./data/models.js";

Hooks.once("init", async function () {
  game.mausritter = {
    MausritterActor,
    MausritterItem,
    rollItemMacro,
    rollStatMacro,
    autoCreateCharacter,
    postTableCard
  };
  patchRollTableChat();

  registerSettings();

  CONFIG.Combat.initiative = {
    formula: "-1d20+@stats.dexterity.value",
    decimals: 2
  };

  CONFIG.Actor.documentClass = MausritterActor;
  CONFIG.Item.documentClass = MausritterItem;
  CONFIG.Actor.dataModels = {
    character: CharacterData,
    hireling: HirelingData,
    creature: CreatureData,
    storage: StorageActorData
  };
  CONFIG.Item.dataModels = {
    item: GearData,
    weapon: WeaponData,
    armor: ArmorData,
    storage: StorageItemData,
    condition: ConditionData,
    spell: SpellData
  };

  CONFIG.MAUSRITTER = {};
  CONFIG.MAUSRITTER.tables = {
    tables: "tables",
    birthsign: "Birthsign",
    physicalDetail: "Physical detail",
    coatPattern: "Mousy Coat Pattern",
    coatColor: "Mousy Coat Color",
    firstName: "Mousy Names - Birthname",
    lastName: "Mousy Names - Matriname"
  };

  const Actors = foundry.documents.collections.Actors;
  const Items = foundry.documents.collections.Items;
  const ActorSheet = foundry.appv1.sheets.ActorSheet;
  const ItemSheet = foundry.appv1.sheets.ItemSheet;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mausritter", MausritterActorSheet, {
    types: ["character"],
    makeDefault: true
  });
  Actors.registerSheet("mausritter", MausritterHirelingSheet, {
    types: ["hireling"],
    makeDefault: false
  });
  Actors.registerSheet("mausritter", MausritterCreatureSheet, {
    types: ["creature"],
    makeDefault: false
  });
  Actors.registerSheet("mausritter", MausritterStorageSheet, {
    types: ["storage"],
    makeDefault: false
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("mausritter", MausritterItemSheet, { makeDefault: true });

  globalThis.Handlebars.registerHelper("concat", function () {
    let outStr = "";
    for (const arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  globalThis.Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });
});

Hooks.once("ready", async function () {
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type !== "Item") return;
    createMausritterMacro(data, slot);
    return false;
  });
});

Hooks.on("renderActorDirectory", (app, html) => {
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root || root.querySelector(".mausritter-create-character")) return;
  const actions = root.querySelector(".header-actions");
  if (!actions) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mausritter-create-character";
  button.innerHTML = `<i class="fa-solid fa-hat-wizard"></i><span>${game.i18n.localize("Maus.CreateMouse")}</span>`;
  button.addEventListener("click", () => game.mausritter.autoCreateCharacter());
  actions.appendChild(button);
});

async function createMausritterMacro(data, slot) {
  const item = await foundry.documents.Item.fromDropData(data);
  if (!item) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  if (!item.isEmbedded) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }

  const command = `game.mausritter.rollItemMacro("${item.name}");`;
  let macro = game.macros.contents.find((m) => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await foundry.documents.Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: {
        "mausritter.itemMacro": true
      }
    });
  }
  await game.user.assignHotbarMacro(macro, slot);
  return false;
}

function rollItemMacro(itemName) {
  const speaker = foundry.documents.ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find((i) => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);
  return actor.rollItem(item.id);
}

function rollStatMacro() {
  const speaker = foundry.documents.ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const stat = actor ? Object.entries(actor.system.stats) : null;
  return actor.rollStatSelect(stat);
}
