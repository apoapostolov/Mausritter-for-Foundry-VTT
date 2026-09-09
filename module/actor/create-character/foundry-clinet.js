export async function getItemFromFoundry(item_id) {
    return await foundry.documents.Item.fromDropData({
        type: "Item",
        uuid: item_id
    });
}

export async function addItem(itemId, instant, slot) {
    const item = await getItemFromFoundry(itemId);
    const itemData = item.toObject();
    delete itemData._id;
    if (slot) {
        if (!itemData.system) itemData.system = {};
        itemData.system.sheet = slot;
    }
    await instant.createEmbeddedDocuments("Item", [itemData]);
}

export async function attrRoll() {
    const roll = await new foundry.dice.Roll("3d6kh2").evaluate();
    return roll.total;
}

export async function drawFromTable(tableName) {
    const pack = game.packs.get(`mausritter.${CONFIG.MAUSRITTER.tables.tables}`)
        ?? game.packs.find((p) => p.documentName === "RollTable" && p.metadata.name === CONFIG.MAUSRITTER.tables.tables);
    if (!pack) {
        ui.notifications.warn(`Table ${tableName} not found.`, {});
        return;
    }
    const inside = await pack.getDocuments();
    const table = inside.find((p) => p.name === tableName);

    if (!table) {
        ui.notifications.warn(`Table ${tableName} not found.`, {});
        return;
    }

    const buffer = await table.roll();
    const result = buffer.results[0];
    return result?.name || result?.description || "";
}
