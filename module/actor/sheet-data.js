import { promptSelect } from "../dialog.js";

/**
 * Build the v9-style actor sheet context that Mausritter templates expect.
 * AppV1 DocumentSheet.getData() no longer provides actor/items bags.
 */

const DEFAULT_SHEET = {
  active: false,
  currentX: 0,
  currentY: 0,
  initialX: 0,
  initialY: 0,
  xOffset: 0,
  yOffset: 0,
  rotation: 0
};

export function wrapActorSheetData(sheet, superData) {
  const actorObject = sheet.actor.toObject(false);
  if (!actorObject.system) actorObject.system = {};
  if (actorObject.system.settings == null) actorObject.system.settings = {};
  const items = Array.isArray(actorObject.items) ? actorObject.items : [];
  for (const item of items) {
    if (!item.system) item.system = {};
    item.system.sheet = foundry.utils.mergeObject(
      foundry.utils.deepClone(DEFAULT_SHEET),
      item.system.sheet ?? {},
      { inplace: false }
    );
  }
  return {
    ...superData,
    actor: actorObject,
    items,
    data: actorObject
  };
}

export function finalizeActorSheetData(sheet, bag) {
  const out = bag.data;
  out.items = bag.items;
  out.owner = sheet.actor.isOwner;
  out.cssClass = bag.cssClass ?? (sheet.isEditable ? "editable" : "locked");
  out.editable = sheet.isEditable;
  out.dtypes = ["String", "Number", "Boolean"];
  if (bag.tabs) out.tabs = bag.tabs;
  return out;
}

export function prepareOwnedItems(sheetData) {
  const actorData = sheetData.actor;
  const gear = [];
  for (const i of sheetData.items) {
    const item = i.system;
    i.img = i.img || CONST.DEFAULT_TOKEN;
    if (item.pips == null) {
      item.pips = { value: 0, max: 0, html: "" };
    }
    let pipHtml = "";
    for (let n = 0; n < item.pips.max; n++) {
      pipHtml += n < item.pips.value ? '<i class="fas fa-circle"></i>' : '<i class="far fa-circle"></i>';
    }
    item.pips.html = pipHtml;
    if (i.type == "item") {
      item.isWeapon = false;
      item.isCondition = false;
    } else if (i.type == "weapon") {
      item.isWeapon = true;
      item.isCondition = false;
      item.weapon.canSwap = item.weapon.dmg2 != "";
    }
    if (item.size == undefined) {
      item.size = { width: 1, height: 1, x: "9em", y: "9em" };
    }
    if (item.sheet.rotation == undefined) item.sheet.rotation = 0;
    item.size.aspect = (item.sheet.rotation == -90
      ? (item.size.width > item.size.height ? item.size.width / item.size.height : item.size.height / item.size.width)
      : 1);
    item.sheet.curHeight = (item.sheet.rotation == -90 ? item.size.width : item.size.height);
    item.sheet.curWidth = (item.sheet.rotation == -90 ? item.size.height : item.size.width);
    item.size.x = (item.sheet.curWidth * 8 + item.sheet.curWidth) + "em";
    item.size.y = (item.sheet.curHeight * 8 + item.sheet.curHeight) + "em";
    const roundScale = 5;
    const xPos = Math.round(item.sheet.currentX / roundScale) * roundScale;
    const yPos = Math.round(item.sheet.currentY / roundScale) * roundScale;
    item.sheet.currentX = xPos;
    item.sheet.currentY = yPos;
    item.sheet.zIndex = xPos + yPos + 1000;
    if (i.type != "storage") item.store = null;
    gear.push(i);
  }
  actorData.gear = gear;
}

export function bindActorSheetListeners(sheet, html) {
  if (!sheet.isEditable) return;
  bind(html, ".item-equip", "click", (ev) => {
    const li = ev.currentTarget.closest(".item");
    const item = itemObject(sheet.actor, li.dataset.itemId);
    item.system.equipped = !item.system.equipped;
    sheet.actor.updateEmbeddedDocuments("Item", [item]);
  });
  bind(html, ".item-create", "click", (ev) => {
    promptCreateOwnedItem(sheet, ev);
  });
  bind(html, ".item-edit", "click", (ev) => {
    const li = ev.currentTarget.closest(".item");
    const item = sheet.actor.getEmbeddedDocument("Item", li.dataset.itemId);
    item.sheet.render({ force: true });
  });
  bind(html, ".item-delete", "click", (ev) => {
    const li = ev.currentTarget.closest(".item");
    sheet.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
  });
  bind(html, ".item-rotate", "click", (ev) => {
    const li = ev.currentTarget.closest(".item");
    const item = itemObject(sheet.actor, li.dataset.itemId);
    item.system.sheet.rotation = item.system.sheet.rotation == -90 ? 0 : -90;
    sheet.actor.updateEmbeddedDocuments("Item", [item]);
  });
  bind(html, ".stat-roll", "click", (ev) => {
    const statName = ev.currentTarget.dataset.key;
    sheet.actor.rollStat(sheet.actor.system.stats[statName]);
  });
  bind(html, ".item-roll", "click", (ev) => {
    const li = ev.currentTarget.closest(".item");
    sheet.actor.rollItem(li.dataset.itemId, { event: ev });
  });
  bindDelegate(html, "change", ".item-input", (ev) => {
    const input = ev.target.closest(".item-input");
    const li = input.closest(".item");
    const item = itemObject(sheet.actor, li.dataset.itemId);
    item[input.name] = input.value;
    sheet.actor.updateEmbeddedDocuments("Item", [item]);
  });
  bind(html, ".pip-button", "mousedown", (ev) => {
    const li = ev.currentTarget.closest(".item");
    const item = itemObject(sheet.actor, li.dataset.itemId);
    let amount = item.system.pips.value;
    if (ev.button == 0 && amount < item.system.pips.max) item.system.pips.value = Number(amount) + 1;
    else if (ev.button == 2 && amount > 0) item.system.pips.value = Number(amount) - 1;
    sheet.actor.updateEmbeddedDocuments("Item", [item]);
  });
  bind(html, ".damage-swap", "mousedown", (ev) => {
    const li = ev.currentTarget.closest(".item");
    const item = itemObject(sheet.actor, li.dataset.itemId);
    const d1 = item.system.weapon.dmg1;
    item.system.weapon.dmg1 = item.system.weapon.dmg2;
    item.system.weapon.dmg2 = d1;
    sheet.actor.updateEmbeddedDocuments("Item", [item]);
  });
}

export function sheetElement(html) {
  return html instanceof HTMLElement ? html : html[0];
}

export function bind(html, selector, type, handler) {
  sheetElement(html).querySelectorAll(selector).forEach((el) => {
    el.addEventListener(type, handler);
  });
}

export function bindDelegate(html, type, selector, handler) {
  const root = sheetElement(html);
  root.addEventListener(type, (event) => {
    const match = event.target instanceof Element ? event.target.closest(selector) : null;
    if (!match || !root.contains(match)) return;
    handler(event, match);
  });
}

export async function promptCreateOwnedItem(sheet, event) {
  const types = ["item", "weapon", "spell", "armor", "condition", "storage"];
  const optionsHtml = types.map((type) => `<option value="${type}">${type}</option>`).join("");
  const type = await promptSelect({
    title: "Create Item",
    heading: "Item Type",
    id: "type",
    optionsHtml,
    okLabel: "Create"
  });
  if (!type) return;
  return createOwnedItem(sheet.actor, event, type);
}

export function createOwnedItem(actor, event, type) {
  event.preventDefault();
  const header = event.currentTarget;
  const dataset = foundry.utils.duplicate(header?.dataset ?? {});
  delete dataset.type;
  const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Item";
  return actor.createEmbeddedDocuments("Item", [{
    name: `New ${label}`,
    type,
    system: dataset
  }]);
}

export function itemObject(actor, itemId) {
  const item = actor.getEmbeddedDocument("Item", itemId);
  return item ? item.toObject() : null;
}

const SLOT_STEP = 130;
const SNAP_RADIUS = 72;
const SLOT_EM = 9.1;

function pointerOffset(event, el) {
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  const cx = event.clientX ?? event.pageX ?? 0;
  const cy = event.clientY ?? event.pageY ?? 0;
  return {
    x: cx - rect.left - rect.width / 2,
    y: cy - rect.top - rect.height / 2
  };
}

function dropArea(event, sheet) {
  const target = event.target instanceof Element ? event.target : null;
  const fromTarget = target?.closest?.("#drag-area");
  if (fromTarget) return fromTarget;
  const area = (event.currentTarget instanceof Element ? event.currentTarget.closest?.("#drag-area") : null)
    ?? sheet?.element?.querySelector("#drag-area")
    ?? null;
  if (!area) return null;
  const x = event.clientX;
  const y = event.clientY;
  if (x == null || y == null) return area;
  const rect = area.getBoundingClientRect();
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
  return area;
}

function dropPoint(event, sheet) {
  return pointerOffset(event, dropArea(event, sheet));
}

function newItemData(item) {
  const data = (item.inCompendium || item.pack)
    ? game.items.fromCompendium(item, { clearFolder: true, keepId: false })
    : item.toObject();
  delete data._id;
  delete data.folder;
  if (!data.system) data.system = {};
  return data;
}

function snapGhost(area, x, y, visible) {
  let ghost = area.querySelector(".mausritter-snap-ghost");
  if (!ghost) {
    ghost = document.createElement("div");
    ghost.className = "mausritter-snap-ghost";
    ghost.setAttribute("aria-hidden", "true");
    area.appendChild(ghost);
  }
  ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  ghost.classList.toggle("active", !!visible);
}

function parseTranslate(el) {
  const transform = el.style.transform || "";
  const match = transform.match(/translate3d\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/i);
  if (!match) return null;
  return { x: Number(match[1]), y: Number(match[2]) };
}

function cellKey(x, y) {
  return `${Math.round(x)}:${Math.round(y)}`;
}

function itemSpan(item) {
  const size = item?.system?.size ?? {};
  const sheet = item?.system?.sheet ?? {};
  const width = Math.max(1, Math.round(Number(size.width) || 1));
  const height = Math.max(1, Math.round(Number(size.height) || 1));
  if (Number(sheet.rotation) === -90) return { w: height, h: width };
  return { w: width, h: height };
}

function footprintCenter(origin, span) {
  return {
    x: origin.x + (span.w - 1) * SLOT_STEP / 2,
    y: origin.y + (span.h - 1) * SLOT_STEP / 2
  };
}

function footprintOrigin(centerX, centerY, span) {
  return {
    x: centerX - (span.w - 1) * SLOT_STEP / 2,
    y: centerY - (span.h - 1) * SLOT_STEP / 2
  };
}

function zoneSize(el) {
  const colsAttr = Number(el.dataset.cols);
  const rowsAttr = Number(el.dataset.rows);
  const widthEm = parseFloat(el.style.width) || SLOT_EM;
  const heightEm = parseFloat(el.style.height) || SLOT_EM;
  return {
    cols: Math.max(1, Number.isFinite(colsAttr) && colsAttr > 0 ? Math.round(colsAttr) : Math.round(widthEm / SLOT_EM)),
    rows: Math.max(1, Number.isFinite(rowsAttr) && rowsAttr > 0 ? Math.round(rowsAttr) : Math.round(heightEm / SLOT_EM))
  };
}

function slotZones(area) {
  if (!area) return [];
  const zones = [];
  for (const el of area.querySelectorAll(".item-slot-dashed")) {
    const pos = parseTranslate(el);
    if (!pos) continue;
    const { cols, rows } = zoneSize(el);
    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          x: pos.x + (col - (cols - 1) / 2) * SLOT_STEP,
          y: pos.y + (row - (rows - 1) / 2) * SLOT_STEP
        });
      }
    }
    zones.push({ cells });
  }
  return zones;
}

function slotAnchors(area) {
  return slotZones(area).flatMap((zone) => zone.cells);
}

function nearestAnchor(x, y, anchors, maxDist = 20) {
  let best = null;
  let bestDist = maxDist;
  for (const anchor of anchors) {
    const dist = Math.hypot(x - anchor.x, y - anchor.y);
    if (dist <= bestDist) {
      bestDist = dist;
      best = anchor;
    }
  }
  return best;
}

function occupiedKeys(actor, exceptId, anchors) {
  const occupied = new Set();
  if (!actor) return occupied;
  const known = new Set(anchors.map((anchor) => cellKey(anchor.x, anchor.y)));
  for (const item of actor.items) {
    if (item.id === exceptId) continue;
    const span = itemSpan(item);
    const sheet = item.system?.sheet ?? {};
    const cx = Number(sheet.currentX) || 0;
    const cy = Number(sheet.currentY) || 0;
    const origin = footprintOrigin(cx, cy, span);
    const start = nearestAnchor(origin.x, origin.y, anchors, SLOT_STEP * 0.6)
      || nearestAnchor(cx, cy, anchors, SLOT_STEP * 0.6);
    if (!start) continue;
    for (let row = 0; row < span.h; row++) {
      for (let col = 0; col < span.w; col++) {
        const key = cellKey(start.x + col * SLOT_STEP, start.y + row * SLOT_STEP);
        if (known.has(key)) occupied.add(key);
      }
    }
  }
  return occupied;
}

function snapToSlot(x, y, area, item, actor, exceptId) {
  const zones = slotZones(area);
  const anchors = zones.flatMap((zone) => zone.cells);
  if (!anchors.length) return { x, y, snapped: false };
  const span = itemSpan(item);
  const cells = new Set(anchors.map((anchor) => cellKey(anchor.x, anchor.y)));
  const occupied = occupiedKeys(actor, exceptId, anchors);
  const aimed = nearestAnchor(x, y, anchors, SNAP_RADIUS);
  const aimedKey = aimed ? cellKey(aimed.x, aimed.y) : null;
  let best = null;
  let bestDist = Infinity;
  for (const origin of anchors) {
    const keys = [];
    let fits = true;
    for (let row = 0; row < span.h && fits; row++) {
      for (let col = 0; col < span.w; col++) {
        const key = cellKey(origin.x + col * SLOT_STEP, origin.y + row * SLOT_STEP);
        if (!cells.has(key) || occupied.has(key)) {
          fits = false;
          break;
        }
        keys.push(key);
      }
    }
    if (!fits) continue;
    const center = footprintCenter(origin, span);
    const dist = Math.hypot(x - center.x, y - center.y);
    const coversAimed = !!(aimedKey && keys.includes(aimedKey));
    if (dist > SNAP_RADIUS && !coversAimed) continue;
    if (dist < bestDist) {
      bestDist = dist;
      best = center;
    }
  }
  return best
    ? { x: best.x, y: best.y, snapped: true }
    : { x, y, snapped: false, blocked: !!aimed };
}

function cardOrigin(event, data, sheet) {
  const point = dropPoint(event, sheet);
  const offset = data?.offset ?? { x: 0, y: 0 };
  return {
    x: point.x - offset.x,
    y: point.y - offset.y
  };
}

function sheetPosition(x, y, previous = {}) {
  return foundry.utils.mergeObject(
    foundry.utils.deepClone(DEFAULT_SHEET),
    {
      ...previous,
      currentX: x,
      currentY: y,
      initialX: x,
      initialY: y,
      xOffset: x,
      yOffset: y
    },
    { inplace: false }
  );
}

export function startOwnedItemDrag(sheet, event) {
  const itemId = event.currentTarget.getAttribute("data-item-id");
  if (!itemId) return;
  const item = sheet.actor.items.get(itemId);
  if (!item) return;
  const offset = pointerOffset(event, event.currentTarget);
  sheet._mausritterDrag = { itemId, offset, dropped: false };
  event.currentTarget.style.opacity = "0.4";
  const payload = item.toObject();
  if (payload.system) payload.system.stored = "";
  event.dataTransfer.setData("text/plain", JSON.stringify({
    type: "Item",
    uuid: item.uuid,
    sheetTab: sheet.actor.flags["_sheetTab"],
    actorId: sheet.actor.id,
    itemId,
    fromToken: sheet.actor.isToken,
    offset,
    data: payload,
    root: event.currentTarget.getAttribute("root")
  }));
}

function previewMagnet(sheet, event, area) {
  const drag = sheet._mausritterDrag;
  if (!drag?.itemId) return;
  const origin = {
    x: dropPoint(event).x - drag.offset.x,
    y: dropPoint(event).y - drag.offset.y
  };
  const item = sheet.actor.items.get(drag.itemId);
  const snapped = snapToSlot(origin.x, origin.y, area, item, sheet.actor, drag.itemId);
  const card = area.querySelector(`.item-card[data-item-id="${drag.itemId}"]`);
  if (!card) return;
  if (snapped.blocked) {
    const pos = item.system?.sheet ?? {};
    card.style.transform = `translate3d(${Number(pos.currentX) || 0}px, ${Number(pos.currentY) || 0}px, 0)`;
    return;
  }
  card.style.transform = `translate3d(${snapped.x}px, ${snapped.y}px, 0)`;
}

export function bindInventoryMagnet(sheet, html) {
  const root = html instanceof HTMLElement ? html : html[0];
  const area = root?.querySelector("#drag-area");
  if (!area || area.dataset.mausritterMagnet === "1") return;
  area.dataset.mausritterMagnet = "1";
  area.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = sheet._mausritterDrag ? "move" : "copy";
    if (sheet._mausritterDrag) {
      snapGhost(area, 0, 0, false);
      previewMagnet(sheet, event, area);
      return;
    }
    const dummy = { system: { size: { width: 1, height: 1 }, sheet: {} } };
    const origin = dropPoint(event, sheet);
    const snapped = snapToSlot(origin.x, origin.y, area, dummy, sheet.actor, null);
    snapGhost(area, snapped.x, snapped.y, snapped.snapped);
  });
  area.addEventListener("dragleave", (event) => {
    if (event.target === area) snapGhost(area, 0, 0, false);
  });
}

export function endOwnedItemDrag(sheet, event) {
  event.currentTarget.style.opacity = "";
  const drag = sheet._mausritterDrag;
  if (drag && !drag.dropped) sheet.render(false);
  sheet._mausritterDrag = null;
}

export async function handleOwnedItemDrop(sheet, event, data) {
  if (!sheet.actor.isOwner) return false;
  const item = await foundry.documents.Item.fromDropData(data);
  if (!item) return false;
  const actor = sheet.actor;
  const area = dropArea(event, sheet);
  if (!area) return false;
  const origin = cardOrigin(event, data, sheet);
  const snapped = snapToSlot(origin.x, origin.y, area, item, actor, data.itemId);
  if (sheet._mausritterDrag) sheet._mausritterDrag.dropped = true;
  snapGhost(area, 0, 0, false);
  if (snapped.blocked) {
    sheet.render(false);
    return false;
  }
  const x = snapped.x;
  const y = snapped.y;

  const sameActor = (data.actorId === actor.id)
    || (actor.isToken && (data.tokenId === actor.token?.id))
    || (item.parent === actor);
  if (sameActor && !event.ctrlKey) {
    const ownedId = data.itemId ?? item.id;
    const current = itemObject(actor, ownedId);
    if (!current) return false;
    current.system.sheet = sheetPosition(x, y, current.system.sheet);
    await actor.updateEmbeddedDocuments("Item", [current]);
    return;
  }

  if (data.actorId && !event.ctrlKey && !data.fromToken && !actor.isToken) {
    const oldActor = game.actors.get(data.actorId);
    if (oldActor && data.itemId) {
      await oldActor.deleteEmbeddedDocuments("Item", [data.itemId]);
    }
  }

  const itemData = newItemData(item);
  itemData.system.sheet = sheetPosition(x, y, itemData.system.sheet);
  return actor.createEmbeddedDocuments("Item", [itemData]);
}

export async function rollFromSheetDataset(actor, event) {
  event.preventDefault();
  const dataset = event.currentTarget.dataset;
  if (!dataset.roll) return;
  const roll = new foundry.dice.Roll(dataset.roll, actor.system);
  await roll.evaluate();
  const label = dataset.label ? `Rolling ${dataset.label} to score under ${dataset.target}` : "";
  return roll.toMessage({
    speaker: foundry.documents.ChatMessage.getSpeaker({ actor }),
    flavor: label
  });
}
