import { isPlaceholderArt } from "../art.js";
import { postMausritterChat } from "./post-roll.js";

function tableArt(img) {
  if (!img || isPlaceholderArt(img)) return "";
  return img;
}

function resultLabel(result) {
  return result?.name || result?.description || result?.text || "";
}

function tableTitle(name = "") {
  if (/^Weather\s/i.test(name)) return "Today's Weather";
  return name;
}

export async function renderTableCard({
  title,
  img = "",
  result,
  total,
  formula,
  description = "",
  details = ""
} = {}) {
  const hasTotal = total !== undefined && total !== null && total !== "";
  const desc = String(description || "").trim();
  const extra = String(details || "").trim();
  const hideDesc = desc && result && desc.replace(/\s+/g, " ") === String(result).replace(/\s+/g, " ");
  return foundry.applications.handlebars.renderTemplate(
    "systems/mausritter/templates/chat/tableroll.html",
    {
      title,
      img: tableArt(img),
      result,
      total,
      formula,
      hasTotal,
      description: hideDesc ? "" : desc,
      details: extra
    }
  );
}

export async function postTableCard(card, extra = {}) {
  const content = await renderTableCard(card);
  return postMausritterChat({
    content,
    rolls: extra.rolls || [],
    whisper: extra.whisper
  });
}

export function patchRollTableChat() {
  const proto = foundry.documents.RollTable.prototype;
  if (proto.mausritterTableCard) return;
  proto.mausritterTableCard = true;
  proto.toMessage = async function toMessage(results, { roll, messageData = {}, messageOptions = {} } = {}) {
    const result = results.map(resultLabel).filter(Boolean).join(", ");
    const description = this.description
      ? await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.description, {
        async: true,
        documents: true,
        secrets: this.isOwner
      })
      : "";
    const content = await renderTableCard({
      title: tableTitle(this.name),
      img: this.img,
      result,
      total: roll?.total,
      formula: roll?.formula,
      description
    });
    return postMausritterChat({
      content,
      rolls: roll ? [roll] : []
    });
  };
}
