# Changelog

## Unreleased

14.0.1. Not released.

## 14.0.0 - 2026-09-10

Foundry VTT v14 release of the unofficial Mausritter system. Baseline is Futilrevenge 0.3.3 on Foundry v12.

### Changed

- Requires Foundry 14.0.0. Verified on 14.367.
- Character, hireling, creature, storage, and item sheets now use ApplicationV2. The paper-white layout stays.
- The mouse generator, rolls, and item-create dialogs use DialogV2.
- Actor and item types use TypeDataModel. `template.json` is still present for existing worlds.
- Advantage keeps the lower d20. Disadvantage keeps the higher. Chat cards attach the Foundry roll so the dice tooltip works.
- New characters and items use Mausritter art instead of Foundry SVG placeholders.

### Added

- Inventory cards snap to nearby dashed slots. Two-slot cards cover two cells. Bank is a three-cell zone. Occupied slots reject the drop.
- Drop items from a compendium onto a character or creature inventory. They snap to a free slot.
- Actor Directory **Create Mouse** button.
- Condition, hireling, creature portrait, and token art in the compendiums.
- Illustrated roll tables; result rows and hex draws use that table's art.
- Character portrait gallery: hover the gallery glyph, pick from 300 mice, clans, and rats, then confirm. Portrait click still opens FilePicker.

### Fixed

- Owned items are no longer wiped on sheet submit.
- Pack macros load v14 sources.
- Paper sheets keep light-theme text in Foundry dark mode.
- Character sheet scrolls so Grit and Bank slots stay reachable.
- Window resize handle stays visible on the white sheet.
- Rolling a weapon with a blank second die no longer crashes.
- Spell, weather, and hex chat cards use the same Mausritter header layout as other rolls.
- Frog Spear uses the official spear icon.
