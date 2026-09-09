import { promptDialog } from "../../dialog.js";

export async function showAdditionalItemsChoiceDialog(items, callback) {
    const template = "systems/mausritter/templates/dialogs/additional-item-choice.html";
    const html = await foundry.applications.handlebars.renderTemplate(template, { items });
    const root = await promptDialog({
        title: "Additional starting items",
        content: html,
        okLabel: "ok",
        cancel: false
    });
    if (!root) return;
    await callback(root.querySelector("select")?.selectedIndex ?? 0);
}
