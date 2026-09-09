async function drawText(name) {
  const pack = game.packs.get("mausritter.tables");
  const tables = pack ? await pack.getDocuments() : [];
  const table = tables.find((t) => t.name === name);
  if (!table) {
    ui.notifications.warn(`Table ${name} not found.`);
    return "";
  }
  const rolled = await table.roll();
  return rolled.results[0]?.name || rolled.results[0]?.description || "";
}

const appearance = await drawText("Non-player mice - Appearance");
const birthsign = await drawText("Non-player mice - Birthsign and Disposition");
const quirk = await drawText("Non-player mice - Quirk");
const social = await drawText("Non-player mice - Social position and Payment for service");
const wants = await drawText("Non-player mice - Wants");
const relationship = await drawText("Non-player mice - Relationship");
const birthname = await drawText("Mousy Names - Birthname");
const matriname = await drawText("Mousy Names - Matriname");
const dexterity = (await new foundry.dice.Roll("2d6").evaluate()).total;
const strength = (await new foundry.dice.Roll("2d6").evaluate()).total;
const will = (await new foundry.dice.Roll("2d6").evaluate()).total;
const health = (await new foundry.dice.Roll("1d6").evaluate()).total;
const notes = `<p><b>Social position and Payment for service:</b> ${social}</p>
<p><b>Appearance:</b> ${appearance}</p>
<p><b>Quirk:</b> ${quirk}</p>
<p><b>Wants:</b> ${wants}</p>
<p><b>Relationship:</b> ${relationship}</p>`;
const npc = await Actor.create({
  name: `${birthname} ${matriname}`,
  type: "hireling",
  system: {
    description: { disposition: birthsign },
    notes,
    stats: {
      dexterity: { max: dexterity, value: dexterity },
      strength: { max: strength, value: strength },
      will: { max: will, value: will }
    },
    health: { max: health, value: health }
  }
});
await npc.sheet.render(true);
