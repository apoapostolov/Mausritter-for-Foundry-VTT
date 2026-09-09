async function tableByName(name) {
  const pack = game.packs.get("mausritter.tables");
  const tables = pack ? await pack.getDocuments() : [];
  const table = tables.find((t) => t.name === name);
  if (!table) ui.notifications.warn(`Table ${name} not found.`);
  return table;
}

async function drawText(name) {
  const table = await tableByName(name);
  if (!table) return "";
  const rolled = await table.roll();
  return rolled.results[0]?.name || rolled.results[0]?.description || "";
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
const landmark = await drawText(`Hex - ${hexType}`);
const details = await drawText("Hex - Landmark Details");
ChatMessage.create({
  content: `<h2>${hexType}:</h2><b>Landmark:</b> ${landmark}<br/><b>Details:</b> <i>${details}</i>`,
  whisper: ChatMessage.getWhisperRecipients("GM")
});
