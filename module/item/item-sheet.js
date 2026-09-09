const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export class MausritterItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["mausritter", "item", "themed", "theme-light"],
    position: { width: 520, height: 480 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  static PARTS = {
    body: { template: "systems/mausritter/templates/item/item-item-sheet.html" }
  };

  static TABS = {
    primary: {
      tabs: [{ id: "description", label: "Maus.ItemDescription" }],
      initial: "description"
    }
  };

  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    parts.body.template = `systems/mausritter/templates/item/item-${this.document.type}-sheet.html`;
    return parts;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.item.toObject(false);
    item.cssClass = this.isEditable ? "editable" : "locked";
    item.editable = this.isEditable;
    item.owner = this.item.isOwner;
    item.tabs = context.tabs;
    return item;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const sheetBody = this.element.querySelector(".sheet-body");
    if (sheetBody) {
      const height = (this.position.height ?? 480) - 192;
      sheetBody.style.height = `${height}px`;
    }
  }
}
