const ROOT = "systems/mausritter/images";
const CUSTOM = `${ROOT}/icons/Custom Mausritter Icons`;
const OFFICIAL = `${ROOT}/icons/Official Mausritter Icons`;
const SAMPLE = `${ROOT}/sample`;

export const MAUS_ART = {
  item: `${CUSTOM}/Maus-Item-Question.png`,
  weapon: `${OFFICIAL}/Maus-Item-Improvised.png`,
  armor: `${OFFICIAL}/Maus-Item-Light-Armor.png`,
  storage: `${OFFICIAL}/Maus-Item-Purse.png`,
  condition: `${CUSTOM}/Maus-Condition-Custom.png`,
  spell: `${OFFICIAL}/Maus-Item-Spell-01.png`,
  character: `${SAMPLE}/Portrait_Mouse.png`,
  hireling: `${SAMPLE}/Portrait_Mouse.png`,
  creature: `${SAMPLE}/Portrait_Mouse.png`,
  storageActor: `${OFFICIAL}/Maus-Item-Purse.png`,
  tokenCharacter: `${SAMPLE}/Token_Mouse.png`,
  tokenCreature: `${SAMPLE}/Token_Mouse.png`
};

export function isPlaceholderArt(img) {
  if (!img) return true;
  const value = String(img).toLowerCase();
  return value.includes("mystery-man")
    || value.includes("item-bag")
    || value.includes("icons/svg/")
    || value.endsWith(".svg");
}

export function itemArtForType(type) {
  return MAUS_ART[type] || MAUS_ART.item;
}

export function actorArtForType(type) {
  if (type === "creature") return { img: MAUS_ART.creature, token: MAUS_ART.tokenCreature };
  if (type === "storage") return { img: MAUS_ART.storageActor, token: MAUS_ART.storageActor };
  return { img: MAUS_ART.character, token: MAUS_ART.tokenCharacter };
}
