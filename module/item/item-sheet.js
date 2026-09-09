const ItemSheet = foundry.appv1.sheets.ItemSheet;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class MausritterItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mausritter", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/mausritter/templates/item";
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /** @override */
  getData() {
    const context = super.getData();
    const item = this.item.toObject(false);
    item.cssClass = context.cssClass;
    item.editable = this.isEditable;
    item.owner = this.item.isOwner;
    return item;
  }

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const root = this.element[0] ?? this.element;
    const sheetBody = root.querySelector(".sheet-body");
    const bodyHeight = position.height - 192;
    if (sheetBody) sheetBody.style.height = `${bodyHeight}px`;
    return position;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.options.editable) return;
  }
}
