export async function postMausritterChat({ actor, content, rolls = [], whisper } = {}) {
  const ChatMessage = foundry.documents.ChatMessage.implementation;
  const usable = (rolls || []).filter(Boolean);
  let body = content || "";
  if (usable.length) {
    const html = [];
    for (const roll of usable) {
      if (typeof roll.render === "function") html.push(await roll.render());
    }
    if (html.length) body += `<div class="mausritter-dice">${html.join("")}</div>`;
  }
  const chatData = {
    speaker: actor
      ? ChatMessage.getSpeaker({ actor })
      : ChatMessage.getSpeaker(),
    content: body,
    rolls: usable
  };
  if (whisper) chatData.whisper = whisper;
  else ChatMessage.applyMode(chatData);
  if (usable.length) chatData.sound = CONFIG.sounds.dice;
  if (game.dice3d && usable[0]) {
    await game.dice3d.showForRoll(usable[0], game.user, true, chatData.whisper, chatData.blind);
  }
  return ChatMessage.create(chatData);
}
