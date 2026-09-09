import { promptDialog } from "../../dialog.js";

export async function showWeaponChoiceDialog(callback) {
    const template = "systems/mausritter/templates/dialogs/weapon-choice.html";
    const html = await foundry.applications.handlebars.renderTemplate(template);
    const root = await promptDialog({
        title: "What weapon do you want?",
        content: html,
        okLabel: "ok"
    });
    if (!root) return;
    callback(root.querySelector("select")?.value);
}
