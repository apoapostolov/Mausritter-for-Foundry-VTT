import { promptDialog } from "../../dialog.js";

export async function showAdditionalItemsInfoDialog(items) {
    const template = "systems/mausritter/templates/dialogs/additional-item-info.html";
    const html = await foundry.applications.handlebars.renderTemplate(template, { items });
    await promptDialog({
        title: "Additional starting items",
        content: html,
        okLabel: "ok",
        cancel: false
    });
}
