const DialogV2 = foundry.applications.api.DialogV2;

export function dialogElement(value) {
  if (value instanceof HTMLElement) return value;
  if (value?.element instanceof HTMLElement) return value.element;
  if (value?.[0] instanceof HTMLElement) return value[0];
  return null;
}

export async function promptDialog({ title, content, okLabel, cancel = true, width = 400 } = {}) {
  const buttons = [{
    action: "ok",
    label: okLabel ?? game.i18n.localize("Maus.Roll"),
    icon: "fa-solid fa-check",
    default: true,
    callback: (_event, _button, dialog) => dialog.element
  }];
  if (cancel) {
    buttons.push({
      action: "cancel",
      label: game.i18n.localize("Maus.Cancel"),
      icon: "fa-solid fa-xmark"
    });
  }
  const result = await DialogV2.wait({
    window: { title },
    position: { width },
    content,
    buttons,
    rejectClose: false
  });
  return dialogElement(result);
}

export async function promptSelect({ title, heading, id, optionsHtml, okLabel } = {}) {
  const root = await promptDialog({
    title,
    okLabel,
    content: `<h2>${heading}</h2> <select style="margin-bottom:10px;" name="${id}" id="${id}">${optionsHtml}</select><br/>`
  });
  return root?.querySelector(`#${id}`)?.value ?? null;
}

export function tableResultText(result) {
  if (!result) return "";
  return result.name || result.description || "";
}
