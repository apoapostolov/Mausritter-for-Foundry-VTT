import { promptDialog, promptSelect } from "../dialog.js";
import { actorArtForType, isPlaceholderArt, MAUS_ART } from "../art.js";
import { postMausritterChat } from "../chat/post-roll.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class MausritterActor extends Actor {
  static DEFAULT_ICON = MAUS_ART.character;

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this;
    const data = actorData.system;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    else if (actorData.type === 'hireling') this._prepareCharacterData(actorData);
    else if (actorData.type === 'creature') this._prepareCharacterData(actorData);

  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    const isCreature = this.type === "creature";
    const isCharacter = this.type === "character";
    const art = actorArtForType(this.type);
    const img = isPlaceholderArt(this.img) || isPlaceholderArt(data.img) ? art.img : this.img;
    const tokenSrc = data.prototypeToken?.texture?.src;
    const textureSrc = (!tokenSrc || isPlaceholderArt(tokenSrc)) ? art.token : tokenSrc;
    const prototypeToken = {
      name: this.name,
      displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      disposition: isCreature ? CONST.TOKEN_DISPOSITIONS.HOSTILE : CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      bar1: { attribute: "health" },
      texture: { src: textureSrc }
    };
    if (isCharacter) {
      prototypeToken.actorLink = true;
      prototypeToken.sight = { enabled: true };
    }
    this.updateSource({ img, prototypeToken });
  }
  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.system;

    // let armorBonus = 0;
    // const armors = this.getEmbeddedCollection("Item").filter(e => "armor" === e.type);

    // for (let armor of armors) {
    //   if (armor.data.equipped) {
    //     armorBonus += armor.data.bonus;
    //   }
    // }
    // data.stats.armor.mod = armorBonus;
  }


  async rollStatSelect(statList) {
    const selectList = statList.map((stat) => {
      const label = game.i18n.localize(`Maus.${stat[1].label}`);
      return `<option value="${stat[0]}">${label}</option>`;
    }).join("");
    const value = await promptSelect({
      title: game.i18n.localize("Maus.RollSelectType"),
      heading: game.i18n.localize("Maus.RollSelectStat"),
      id: "stat",
      optionsHtml: selectList
    });
    if (!value) return;
    return this.rollStat(this.system.stats[value]);
  }

  async rollStat(attribute) {
    const optionsHtml = `<option value="none">${game.i18n.localize("Maus.RollNone")}</option><option value="advantage">${game.i18n.localize("Maus.RollAdvantage")}</option><option value="disadvantage">${game.i18n.localize("Maus.RollDisadvantage")}</option>`;
    const value = await promptSelect({
      title: game.i18n.localize("Maus.RollSelectType"),
      heading: game.i18n.localize("Maus.RollAdvantageDisadvantage"),
      id: "advantage",
      optionsHtml
    });
    if (!value) return;
    return this.rollAttribute(attribute, value);
  }

  async rollItem(itemId, options = { event: null }) {
    const item = this.getEmbeddedDocument("Item", itemId)?.toObject();
    if (!item) return;

    if (item.type == "weapon") {
      const optionsHtml = `<option value="normal">${game.i18n.localize("Maus.RollNormal")}</option><option value="enhanced">${game.i18n.localize("Maus.RollEnhanced")}</option><option value="impaired">${game.i18n.localize("Maus.RollImpaired")}</option>`;
      const value = await promptSelect({
        title: game.i18n.localize("Maus.RollSelectStat"),
        heading: `${game.i18n.localize("Maus.RollEnhanced")}/${game.i18n.localize("Maus.RollImpaired")}`,
        id: "enhanced",
        optionsHtml
      });
      if (!value) return;
      return this.rollWeapon(item, value);
    }
    if (item.type == "spell") {
      const root = await promptDialog({
        title: game.i18n.localize("Maus.RollSelectStat"),
        content: `<h2>${game.i18n.localize("Maus.RollPowerDesc")}</h2> <input style="margin-bottom:10px;" name="power" id="power" value="1"></input><br/>`
      });
      if (!root) return;
      return this.rollSpell(item, root.querySelector("#power")?.value ?? "1");
    }
    return this.chatDesc(item);
  }

  async rollWeapon(item = "", state = ""){
    let die = (Number(item.system.weapon.selected) === 0 ? item.system.weapon.dmg1 : item.system.weapon.dmg2);
    if (state == "impaired") die = "d4";
    if (state == "enhanced") die = "d12";
    if (!die) die = item.system.weapon.dmg1 || item.system.weapon.dmg2;
    if (!die) {
      ui.notifications.warn(`${item.name} has no damage die.`);
      return;
    }

    let damageRoll = new foundry.dice.Roll(die);
    await damageRoll.evaluate();
    //damageRoll.roll();

    const diceData = this.formatDice(damageRoll);

    //Create the pip HTML.
    let pipHtml = "<div style='margin-top: 5px;'>";
    for (let i = 0; i < item.system.pips.max; i++) {
      if (i < item.system.pips.value)
        pipHtml += '<i class="fas fa-circle">&nbsp;</i>'
      else
        pipHtml += '<i class="far fa-circle">&nbsp;</i>';
    }
    pipHtml += "</div>";

    var templateData = {
      actor: this,
      data: {
        diceTotal: {
          damageValue: damageRoll._total,
          damageRoll: damageRoll
        },
      },
      item: item,
      pip: pipHtml,
      rollTitle: game.i18n.localize('Maus.RollDamage'), //The title of the roll.
      rollText: damageRoll._total, //What is printed within the roll amount.
      damageDice: die,
      weaponState: game.i18n.localize('Maus.Roll' + state.charAt(0).toUpperCase() + state.slice(1)), 
      isWeapon: true,
      diceData
    };

    const template = "systems/mausritter/templates/chat/statroll.html";
    const content = await foundry.applications.handlebars.renderTemplate(template, templateData);
    return postMausritterChat({ actor: this, content, rolls: [damageRoll] });
  }

  async rollSpell(item = "", power = ""){
    let die = power+"d6";

    let damageRoll = new foundry.dice.Roll(die);
    await damageRoll.evaluate();

    const diceData = this.formatDice(damageRoll);

    let rollDiv = '';

    let usage = 0;
    let miscast = 0;

    for(let i=0; i < parseInt(power); i++){
      if(i > 0)
      rollDiv += ', ' + diceData.dice[i].result;
      else
      rollDiv += '' + diceData.dice[i].result;

      if(diceData.dice[i].result >= 4){
        usage++;
        if(diceData.dice[i].result == 6){
          miscast++;
        }
      }
    }

    if(item.system.description == null){
      item.system.description = "";
    }
  
    item.system.description = item.system.description.split(game.i18n.localize('Maus.RollDiceKeyword')).join("<strong style='text-decoration:underline' class='red'>"+power+"</strong>");
    item.system.description = item.system.description.split(game.i18n.localize('Maus.RollSumKeyword')).join("<strong style='text-decoration:underline' class='red'>"+damageRoll._total+"</strong>");
    item.system.description += `<div class="roll-usage">${game.i18n.localize("Maus.RollUsage")}: <strong>${usage}</strong></div>`;
    if(miscast){
      let miscastDesc = game.i18n.localize('Maus.RollMiscastDesc');
      miscastDesc = miscastDesc.replace("!miscast!", ""+miscast);
      item.system.description += `<div class="roll-usage">${game.i18n.localize("Maus.RollMiscast")}: <strong>${miscast}</strong></div>` + miscastDesc;
    }

    //Create the pip HTML.
    let pipHtml = "<div style='margin-top: 5px;'>";
    for (let i = 0; i < item.system.pips.max; i++) {
      if (i < item.system.pips.value)
        pipHtml += '<i class="fas fa-circle">&nbsp;</i>'
      else
        pipHtml += '<i class="far fa-circle">&nbsp;</i>';
    }
    pipHtml += "</div>";

    var templateData = {
      actor: this,
      data: {
        diceTotal: {
          damageValue: damageRoll._total,
          damageRoll: damageRoll
        },
        rollDiv:rollDiv
      },
      item: item,
      pip: pipHtml,
      isSpell: true,
      isWeapon:true,
      rollTitle: game.i18n.localize('Maus.RollSum'),
      rollText: damageRoll._total,
      weaponState: `${power} ${game.i18n.localize('Maus.RollDice')}`,
      sum: damageRoll._total,
      dice: power,
      diceData
    };

    const template = "systems/mausritter/templates/chat/statroll.html";
    const content = await foundry.applications.handlebars.renderTemplate(template, templateData);
    return postMausritterChat({ actor: this, content, rolls: [damageRoll] });
  }

  async rollAttribute(attribute, advantage, item = "", rollOver = false) {
    let attributeName = attribute.label?.charAt(0).toUpperCase() + attribute.label?.toLowerCase().slice(1);
    if (!attribute.label && isNaN(attributeName))
      attributeName = attribute.charAt(0)?.toUpperCase() + attribute.toLowerCase().slice(1);

    let formula = "1d20";
    if (advantage === "advantage") formula = rollOver ? "2d20kh" : "2d20kl";
    if (advantage === "disadvantage") formula = rollOver ? "2d20kl" : "2d20kh";

    const r = new foundry.dice.Roll(formula, {});
    await r.evaluate();

    let damageRoll = 0;
    if (item && item.type == "weapon") {
      damageRoll = new foundry.dice.Roll(item.system.damage);
      await damageRoll.evaluate();
    }

    const diceData = this.formatDice(r);

    let mod = 0;
    if (attribute.mod > 0) mod = attribute.mod;

    let targetValue = attribute.value + mod + (item == "" ? 0 : item.system.bonus);

    let resultText = "";
    if (rollOver == true) {
      resultText = (r.total >= targetValue ? game.i18n.localize("Maus.RollSuccess") : game.i18n.localize("Maus.RollFailure"));
    } else {
      resultText = (r.total <= targetValue ? game.i18n.localize("Maus.RollSuccess") : game.i18n.localize("Maus.RollFailure"));
    }

    let advantageLabel = "";
    if (advantage === "advantage") advantageLabel = game.i18n.localize("Maus.RollAdvantage");
    if (advantage === "disadvantage") advantageLabel = game.i18n.localize("Maus.RollDisadvantage");

    const templateData = {
      actor: this,
      stat: {
        name: game.i18n.localize("Maus." + attributeName).toUpperCase()
      },
      data: {
        diceTotal: {
          value: r.total,
          damageValue: damageRoll._total,
          damageRoll: damageRoll
        },
        resultText: {
          value: resultText
        },
        isCreature: {
          value: this.type == "hireling" ? true : false
        }
      },
      target: attribute.value,
      mod: mod,
      item: item,
      targetValue: targetValue,
      useSkill: item?.type == "skill",
      isWeapon: item?.type == "weapon",
      advantage: false,
      advantageLabel,
      diceData
    };

    const template = "systems/mausritter/templates/chat/statroll.html";
    const content = await foundry.applications.handlebars.renderTemplate(template, templateData);
    const rolls = [r];
    if (damageRoll && damageRoll.evaluate) rolls.push(damageRoll);
    return postMausritterChat({ actor: this, content, rolls });
  }

  formatDice(diceRoll) {
    let diceData = { dice: [] };

    if (diceRoll != null) {
      let pushDice = (diceData, total, faces, color) => {
        let img = null;
        if ([4, 6, 8, 10, 12, 20].indexOf(faces) > -1) {
          img = `../icons/svg/d${faces}-grey.svg`;
        }
        diceData.dice.push({
          img: img,
          result: total,
          dice: true,
          color: color
        });
      };

      for (let i = 0; i < diceRoll.terms.length; i++) {
        if (diceRoll.terms[i] instanceof foundry.dice.terms.Die) {
          let pool = diceRoll.terms[i].results;
          let faces = diceRoll.terms[i].faces;

          pool.forEach((pooldie) => {
            if (pooldie.discarded) {
              pushDice(diceData, pooldie.result, faces, "#777");
            } else {
              pushDice(diceData, pooldie.result, faces, "white");
            }

          });
        } else if (typeof diceRoll.terms[i] == 'string') {
          const parsed = parseInt(diceRoll.terms[i]);
          if (!isNaN(parsed)) {
            diceData.dice.push({
              img: null,
              result: parsed,
              dice: false,
              color: 'white'
            });
          } else {
            diceData.dice.push({
              img: null,
              result: diceRoll.terms[i],
              dice: false
            });
          }
        }
        else if (typeof diceRoll.terms[i] == 'number') {
          const parsed = parseInt(diceRoll.terms[i]);
          if (!isNaN(parsed)) {
            diceData.dice.push({
              img: null,
              result: parsed,
              dice: false,
              color: 'white'
            });
          } else {
            diceData.dice.push({
              img: null,
              result: diceRoll.terms[i],
              dice: false
            });
          }
        }
      }
    }

    return diceData;
  }

  // Print the item description into the chat.
  async chatDesc(item) {
    let itemName = item.name?.charAt(0).toUpperCase() + item.name?.toLowerCase().slice(1);
    if (!item.name && isNaN(itemName))
      itemName = item.charAt(0)?.toUpperCase() + item.toLowerCase().slice(1);

    //Create the pip HTML.
    let pipHtml = "<div style='margin-top: 5px;'>";
    for (let i = 0; i < item.system.pips.max; i++) {
      if (i < item.system.pips.value)
        pipHtml += '<i class="fas fa-circle">&nbsp;</i>'
      else
        pipHtml += '<i class="far fa-circle">&nbsp;</i>';
    }
    pipHtml += "</div>";

    if(item.system.description == null){
      item.system.description = "";
    } else if(item.system.description.length > 0){
      item.system.description += "<br/>";
    }
    if(item.type == "condition"){
      item.system.description += item.system.desc+"<br/><strong>Clear: </strong>"+item.system.clear;
    }

    var templateData = {
      actor: this,
      stat: {
        name: itemName.toUpperCase()
      },
      item: item,
      pip: pipHtml,
      onlyDesc: true
    };

    const template = "systems/mausritter/templates/chat/statroll.html";
    const content = await foundry.applications.handlebars.renderTemplate(template, templateData);
    return postMausritterChat({ actor: this, content });
  }

}