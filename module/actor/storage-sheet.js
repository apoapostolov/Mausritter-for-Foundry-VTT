import { wrapActorSheetData, finalizeActorSheetData, createOwnedItem, itemObject, startOwnedItemDrag, handleOwnedItemDrop, rollFromSheetDataset, bindInventoryMagnet, endOwnedItemDrag, bind, bindDelegate, promptCreateOwnedItem, sheetElement } from "./sheet-data.js";

const ActorSheet = foundry.appv1.sheets.ActorSheet;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MausritterStorageSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["mausritter", "sheet", "actor", "storage"],
            template: "systems/mausritter/templates/actor/storage-sheet.html",
            width: 475,
            height: 500,
            resizable: false,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "character" }]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = wrapActorSheetData(this, super.getData());

        // Prepare items.
        if (this.actor.type == 'storage') {
            this._prepareCharacterItems(data);
        }

        data.data.system.storeDiv = "";
        data.data.system.size.divWidth = data.data.system.size.width * 130 + 35;
        data.data.system.size.divHeight = data.data.system.size.height * 130 + 35;

        let storenum = 0;
        for (let y = 0; y < data.data.system.size.height; y++) {
            for (let x = 0; x < data.data.system.size.width; x++) {
                storenum++;
                data.data.system.storeDiv += '\
                <div class="item-slot-dashed" style="transform: translate3d('+ (x * 130 - (data.data.system.size.width - 1) * 65) + 'px, ' + (y * 130 - (data.data.system.size.height - 1) * 65) + 'px, 0px);">\
                    <div class="item-bag-text">\
                        '+ storenum + '\
                    </div>\
                </div>';
            }
        }


        this.position.width = data.data.system.size.width * 130 + 80;
        this.position.height = data.data.system.size.height * 130 + 230;


        return finalizeActorSheetData(this, data);
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterItems(sheetData) {

        const actorData = sheetData.actor;

        // Initialize containers.
        const gear = [];

        // Iterate through items, allocating to containers
        // let totalWeight = 0;
        for (let i of sheetData.items) {
            let item = i.system;
            i.img = i.img || CONST.DEFAULT_TOKEN;

            // We'll handle the pip html here.
            if (item.pips == null) {
                item.pips = {
                    "value": 0,
                    "max": 0,
                    "html": ""
                };
            }
            let pipHtml = "";
            for (let i = 0; i < item.pips.max; i++) {
                if (i < item.pips.value)
                    pipHtml += '<i class="fas fa-circle"></i>'
                else
                    pipHtml += '<i class="far fa-circle"></i>';
            }
            item.pips.html = pipHtml;
            // End of the pip handler

            // Now we'll set tags
            if (i.type == "item") { item.isWeapon = false; item.isCondition = false; }
            else if (i.type == "weapon") {
                item.isWeapon = true;
                item.isCondition = false;

                if (item.weapon.dmg2 != "") {
                    item.weapon.canSwap = true;
                } else {
                    item.weapon.canSwap = false;
                }
            }

            if (item.size == undefined) {
                item.size = {
                    "width": 1,
                    "height": 1,
                    "x": "9em",
                    "y": "9em"
                }
            }
            if (item.sheet.rotation == undefined)
                item.sheet.rotation = 0;

            item.size.aspect = (item.sheet.rotation == -90 ? (item.size.width > item.size.height ? item.size.width / item.size.height : item.size.height / item.size.width) : 1);

            item.sheet.curHeight = (item.sheet.rotation == -90 ? item.size.width : item.size.height);
            item.sheet.curWidth = (item.sheet.rotation == -90 ? item.size.height : item.size.width);

            item.size.x = (item.sheet.curWidth * 8 + item.sheet.curWidth) + "em";
            item.size.y = (item.sheet.curHeight * 8 + item.sheet.curHeight) + "em";

            let roundScale = 5;
            let xPos = Math.round(item.sheet.currentX / roundScale) * roundScale;
            let yPos = Math.round(item.sheet.currentY / roundScale) * roundScale;
            item.sheet.currentX = xPos;
            item.sheet.currentY = yPos;
            item.sheet.zIndex = xPos + yPos + 1000;
            
            if(i.type != "storage"){
                item.store = null;
            }

            gear.push(i);
        }

        // Assign and return
        sheetData.actor.gear = gear;
        
    }

    //   /** @override */
    //   async _render(force=false, options={}) {
    //     if ( force ) this.token = options.token || null;
    //     return super._render(force, options);
    //   }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Update Inventory Item
        bind(html, '.item-equip', 'click', ev => {
            const li = ev.currentTarget.closest(".item");
            const item = itemObject(this.actor, li.dataset.itemId)

            item.system.equipped = !item.system.equipped;
            this.actor.updateEmbeddedDocuments('Item', [item]);
        });


        // Add Inventory Item
        bind(html, '.item-create', 'click', ev => {
            promptCreateOwnedItem(this, ev);
        });

        // Update Inventory Item
        bind(html, '.item-edit', 'click', ev => {
            const li = ev.currentTarget.closest(".item");
            const item = this.actor.getEmbeddedDocument("Item", li.dataset.itemId);
            item.sheet.render(true);
        });

        // Delete Inventory Item
        bind(html, '.item-delete', 'click', ev => {
            const li = ev.currentTarget.closest(".item");
            this.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
            
        });

        // Rotate Inventory Item
        bind(html, '.item-rotate', 'click', ev => {
            const li = ev.currentTarget.closest(".item");
            const item = itemObject(this.actor, li.dataset.itemId)
            if (item.system.sheet.rotation == -90)
                item.system.sheet.rotation = 0;
            else
                item.system.sheet.rotation = -90;
            this.actor.updateEmbeddedDocuments('Item', [item]);
        });

        // Rollable Attributes
        bind(html, '.stat-roll', 'click', ev => {
            const statName = ev.currentTarget.dataset.key;
            const attribute = this.actor.system.stats[statName];
            this.actor.rollStat(attribute);
        });

        // Rollable Item/Anything with a description that we want to click on.
        bind(html, '.item-roll', 'click', ev => {
            const li = ev.currentTarget.closest(".item");
            this.actor.rollItem(li.dataset.itemId, {
                event: ev
            });
        });

        // If we have an item input being adjusted from the character sheet.
        bindDelegate(html, 'change', '.item-input', ev => {
            const input = ev.target.closest('.item-input');
            const li = input.closest('.item');
            const item = itemObject(this.actor, li.dataset.itemId);
            item[input.name] = input.value;
            this.actor.updateEmbeddedDocuments('Item', [item]);
        });

        bind(html, '.pip-button', 'mousedown', ev => {
            const li = ev.currentTarget.closest(".item");
            const item = itemObject(this.actor, li.dataset.itemId)

            let amount = item.system.pips.value;

            if (ev.button == 0) {
                if (amount < item.system.pips.max) {
                    item.system.pips.value = Number(amount) + 1;
                }
            } else if (ev.button == 2) {
                if (amount > 0) {
                    item.system.pips.value = Number(amount) - 1;
                }
            }

            this.actor.updateEmbeddedDocuments('Item', [item]);
        });


        bind(html, '.damage-swap', 'mousedown', ev => {
            const li = ev.currentTarget.closest(".item");
            const item = itemObject(this.actor, li.dataset.itemId)

            let d1 = item.system.weapon.dmg1;
            let d2 = item.system.weapon.dmg2;

            item.system.weapon.dmg1 = d2;
            item.system.weapon.dmg2 = d1;
            this.actor.updateEmbeddedDocuments('Item', [item]);
        });



        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragItemStart(ev);
            let dragEnd = ev => this._onDragOver(ev);

            sheetElement(html).querySelectorAll("li.dropitem").forEach((li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });

            sheetElement(html).querySelectorAll("div.dropitem").forEach((div) => {
                if (div.classList.contains("inventory-header")) return;
                div.setAttribute("draggable", true);
                div.addEventListener("dragstart", handler, false);
                div.addEventListener("dragend", dragEnd, false);
            });
            bindInventoryMagnet(this, html);


            // Item Card handler

            // html.find('div.dragItems').each((i, dragItem) => {

            //     const item = duplicate(this.actor.getEmbeddedDocument("Item", dragItem.dataset.itemId))
            //     // let dragItem = document.querySelector("#" + container.dataset.itemId);
            //     var curIndex = 1; //The current zIndex

            //     if (item.system.sheet == undefined) {
            //         item.system.sheet = {
            //             "active": false,
            //             "currentX": 0,
            //             "currentY": 0,
            //             "initialX": 0,
            //             "initialY": 0,
            //             "xOffset": 0,
            //             "yOffset": 0
            //         };
            //     }

            //     console.log("Item Position Update");
            //     setTranslate(item.system.sheet.currentX, item.system.sheet.currentY, dragItem, true);
            //     dragItem.style.zIndex = item.system.sheet.currentX + 500;

            //     function setTranslate(xPos, yPos, el, round = false) {

            //         if (round) {
            //             let roundScale = 5;
            //             xPos = Math.round(xPos / roundScale) * roundScale;
            //             yPos = Math.round(yPos / roundScale) * roundScale;
            //         }
            //         el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
            //     }
            // });
        }


    }

    /* -------------------------------------------- */

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    _onItemCreate(event, type) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        //const type = header.dataset.type;
        // Grab any data associated with this control.
        return createOwnedItem(this.actor, event, type);
    }

    /**
     * Handle creating a new Owned skill for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    _onSkillCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        return createOwnedItem(this.actor, event, type);
    }


    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll(event) {
        return rollFromSheetDataset(this.actor, event);
    }

    _onDragItemStart(event) {
        startOwnedItemDrag(this, event);
    }

    _onDragOver(event) {
        endOwnedItemDrag(this, event);
    }

    async _onDropItem(event, data) {
        return handleOwnedItemDrop(this, event, data);
    }

}
