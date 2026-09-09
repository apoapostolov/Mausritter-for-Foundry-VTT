import { promptDialog } from "../../dialog.js";

export async function showCreateCharacterDialog(callback) {
    const template = "systems/mausritter/templates/dialogs/create-character.html";
    const html = await foundry.applications.handlebars.renderTemplate(template);
    const root = await promptDialog({
        title: "What do you want to create?",
        content: html,
        okLabel: "ok",
        width: 420
    });
    if (!root) return;
    const formElement = root.querySelector("fieldset");
    const formData = new foundry.applications.ux.FormDataExtended(formElement);
    callback(formData.object);
}
