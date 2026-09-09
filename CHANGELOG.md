# Changelog

## 14.0.0 - 2026-09-09

Foundry VTT v14 release of the unofficial Mausritter system. Baseline is Futilrevenge 0.3.3 on Foundry v12.

### Changed

- Requires Foundry 14.0.0. Verified on 14.367.
- Character, hireling, creature, storage, and item sheets now use ApplicationV2. The paper-white layout stays.
- The mouse generator, rolls, and item-create dialogs use DialogV2.
- Actor and item types use TypeDataModel. `template.json` is still present for existing worlds.

### Added

- Inventory cards snap to nearby dashed slots. Two-slot cards cover two cells. Bank is a three-cell zone.
- Drop items from a compendium onto a character or creature inventory. They snap to a free slot.
- Actor Directory **Create Mouse** button.

### Fixed

- Owned items are no longer wiped on sheet submit.
- Pack macros load v14 sources.
- Paper sheets keep light-theme text in Foundry dark mode.
- Character sheet scrolls so Grit and Bank slots stay reachable.
- Window resize handle stays visible on the white sheet.
