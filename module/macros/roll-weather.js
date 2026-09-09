const seasons = ["Summer", "Autumn", "Winter", "Spring"];
const options = seasons.map((s) => `<option value="${s}">${s}</option>`).join("");
const root = await foundry.applications.api.DialogV2.wait({
  window: { title: "Select Season" },
  content: `<h2>Season</h2><select name="stat" id="stat">${options}</select>`,
  buttons: [
    { action: "ok", label: "Roll", icon: "fa-solid fa-check", default: true, callback: (_e, _b, d) => d.element },
    { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark" }
  ],
  rejectClose: false
});
if (!(root instanceof HTMLElement)) return;
const season = root.querySelector("#stat")?.value;
const pack = game.packs.get("mausritter.tables");
const tables = pack ? await pack.getDocuments() : [];
const table = tables.find((t) => t.name === `Weather ${season}`);
if (!table) return ui.notifications.warn(`Table Weather ${season} not found.`);
const { roll, results } = await table.roll();
await table.toMessage(results, {
  roll,
  messageData: {
    whisper: foundry.documents.ChatMessage.getWhisperRecipients("GM")
  }
});
