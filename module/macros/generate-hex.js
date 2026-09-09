async function tableByName(name) {
  const pack = game.packs.get("mausritter.tables");
  const tables = pack ? await pack.getDocuments() : [];
  const table = tables.find((t) => t.name === name);
  if (!table) ui.notifications.warn(`Table ${name} not found.`);
  return table;
}

async function drawTable(name) {
  const table = await tableByName(name);
  if (!table) return { text: "", roll: null };
  const rolled = await table.roll();
  const row = rolled.results[0];
  return {
    text: row?.name || row?.description || "",
    roll: rolled.roll || null,
    img: table.img || ""
  };
}

const types = ["Random", "Countryside", "Forest", "River", "Human Town"];
const options = types.map((s) => `<option value="${s}">${s}</option>`).join("");
const root = await foundry.applications.api.DialogV2.wait({
  window: { title: "Select Type" },
  content: `<h2>Select or Roll Hex Type</h2><select name="stat" id="stat">${options}</select>`,
  buttons: [
    { action: "ok", label: "Roll", icon: "fa-solid fa-check", default: true, callback: (_e, _b, d) => d.element },
    { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark" }
  ],
  rejectClose: false
});
if (!(root instanceof HTMLElement)) return;
let hexType = root.querySelector("#stat")?.value;
const randomHex = ["Countryside", "Forest", "River", "Human Town"];
if (hexType === "Random") hexType = randomHex[Math.floor(Math.random() * randomHex.length)];
const landmark = await drawTable(`Hex - ${hexType}`);
const details = await drawTable("Hex - Landmark Details");
const rolls = [landmark.roll, details.roll].filter(Boolean);
await game.mausritter.postTableCard({
  title: `Hex - ${hexType}`,
  img: landmark.img,
  result: landmark.text,
  total: landmark.roll?.total,
  formula: landmark.roll?.formula,
  details: details.text ? `<p>${details.text}</p>` : ""
}, {
  rolls,
  whisper: foundry.documents.ChatMessage.getWhisperRecipients("GM")
});
