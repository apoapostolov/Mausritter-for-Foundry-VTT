/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class MausritterItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this;
    const actorData = this.actor ? this.actor.system : {};
    const data = itemData.system;
  }

  static chatListeners(html) {
    const root = html instanceof HTMLElement ? html : html[0];
    root?.querySelectorAll('.use-skill').forEach((el) => {
      el.addEventListener('click', this._onChatUseSkill.bind(this));
    });
  }

  static async _onChatUseSkill(event) {
    const token = event.currentTarget.closest(".mausritter");
    const actor = this._getChatCardActor(token);
    if (!actor) return;

    const div = event.currentTarget.children[0];
    const skillId = div.dataset.itemId;
    actor.rollSkill(skillId);
  }

}
