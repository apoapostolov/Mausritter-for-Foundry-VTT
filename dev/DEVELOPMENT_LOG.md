# Mausritter v14 port log

## 2026-04-07

Started the v14.0.0 playable port from Futil `v12` / `0.3.3` (`b41ed54`) against Foundry **14.367**.

Source checkout: `C:/git-foundry/Mausritter-for-Foundry-VTT`
Live dest: `C:/FoundryData.14/Data/systems/mausritter`

What landed:
- Manifest compatibility `14.0.0` / verified `14.367`, `grid.distance/units`, pack paths without `.db`
- LevelDB `CURRENT` rewritten to LF; `.gitattributes` marks `packs/**` binary
- Sheet context helper so AppV1 `getData` still feeds `{name, system, items}`
- `prototypeToken` on actor `_preCreate`
- Namespaced Dialog/Roll/Die/collections/sheets
- Generator looks up `mausritter.tables` by pack name
- Hotbar macros use `Item.fromDropData`

Live-sync `--full` failed the size gate on empty LevelDB `LOCK` / `*.log` files. JS and `system.json` still copied. Empty lib stubs are unused.

Smoke on world `mausritter-qa` (Foundry 14.367):
- Packs open: weapons 14, armor 2, gear 73, conditions 6, spells 15, creatures 11, tables 22, macros 5
- Grid: 1 in, square, equidistant
- Character/hireling/creature/storage sheets render (AppV1 deprecation warning only)
- `prototypeToken`: character linked+sight, creature hostile, bar1 health
- Embedded item create with `system.tag` persists after sheet render
- Birthsign table roll returns text

Removed `_updateObject(..., {diff: false})` from all four actor sheets. That replace-update wiped owned items on first render.

Inventory magnet: drop and dragover preview snap to dashed slots within 72px. Slot grid is read from the sheet DOM, including grit/bank extra cells and storage grids. Far drops keep free placement.

Follow-up pass:
- DialogV2 for generator, attribute/weapon/spell rolls, and item create
- TypeDataModel registered for all actor/item types; Heath Black still CharacterData with items intact
- TableResult reads name/description; 411 pack rows named; macros load `module/macros/*.js`
- Recycled leftover NeDB `.db` files, empty lib stubs, Dark Heresy creature-settings
- Vanilla click/mousedown binds on the four actor sheets

Still later: drop template.json, AppV2 sheets, version bump.
