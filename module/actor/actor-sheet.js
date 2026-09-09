import {
  wrapActorSheetData,
  finalizeActorSheetData,
  prepareOwnedItems,
  bindActorSheetListeners,
  startOwnedItemDrag,
  handleOwnedItemDrop,
  bindInventoryMagnet,
  endOwnedItemDrag
} from "./sheet-data.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class MausritterActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["mausritter", "actor", "character", "themed", "theme-light"],
    position: { width: 742, height: 800 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  static PARTS = {
    body: { template: "systems/mausritter/templates/actor/actor-sheet.html" }
  };

  static TABS = {
    primary: {
      tabs: [
        { id: "drag", label: "Maus.Inventory" },
        { id: "notes", label: "Maus.Notes" }
      ],
      initial: "drag"
    }
  };

  #dragDrop = null;

  get _dragDrop() {
    return this.#dragDrop ??= new foundry.applications.ux.DragDrop.implementation({
      dragSelector: ".dropitem",
      dropSelector: "#drag-area",
      permissions: {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      },
      callbacks: {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        dragend: this._onDragEnd.bind(this),
        drop: this._onDrop.bind(this)
      }
    });
  }

  async _prepareContext(options) {
    const superData = await super._prepareContext(options);
    const bag = wrapActorSheetData(this, superData);
    prepareOwnedItems(bag);
    return finalizeActorSheetData(this, bag);
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    bindActorSheetListeners(this, this.element);
    if (this.actor.isOwner) bindInventoryMagnet(this, this.element);
  }

  _onDragStart(event) {
    startOwnedItemDrag(this, event);
  }

  _onDragEnd(event) {
    endOwnedItemDrag(this, event);
  }

  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    if (data?.type === "Item") return handleOwnedItemDrop(this, event, data);
    return super._onDrop(event);
  }
}
