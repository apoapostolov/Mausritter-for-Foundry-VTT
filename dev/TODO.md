# Mausritter v14 port

Source: Futil/foundry-mausritter `v12` / `0.3.3` (`b41ed54`)
Target: Foundry **14.367** (compatibility minimum `14.0.0`)

## Playable on 14.367
- [x] Source checkout at `C:/git-foundry/Mausritter-for-Foundry-VTT`
- [x] Manifest: compatibility, grid, pack paths, LICENSE
- [x] Packs: LF CURRENT + binary gitattributes
- [x] Init: namespaced collections/sheets, prototypeToken `_preCreate`
- [x] Actor/item sheets: getData context, `system` on create
- [x] Remove `_updateObject({diff: false})` (it wiped owned items)
- [x] Generator: pack name lookup, namespaced Dialog/Roll, Actor Directory **Create Mouse**
- [x] Generator click-through (stats / weapon / extra item)
- [x] Inventory drag: uuid payload, keep rotation, transfer between actors
- [x] Magnetic snap to nearby dashed slots (drop + dragover preview)
- [x] 2-slot cards snap across two adjacent cells; Bank is a 3-cell zone (3x1 or 2+1)
- [x] `TableResult` uses `name` / `description` (411 pack rows named)
- [x] DialogV2 for generator, rolls, and item create
- [x] TypeDataModel for all actor and item types (template.json still present)
- [x] Strip leftover `console.log` in `rollAttribute` and storage getData
- [x] Recycle dead Dark Heresy leftover, empty `lib/`, leftover NeDB `packs/*.db`
- [x] Vanilla listeners on actor/item sheets (AppV1 still passes jQuery `html`)
- [x] Pack macros load v14 sources from `module/macros/`
- [x] Live-sync + disposable-world smoke (`mausritter-qa`)

## Still open
- [ ] Drop `template.json` after a world-migration pass
- [x] AppV2 sheets (character, hireling, creature, storage, items) on branch appv2
- [x] Stay on release 14.0.0 (rebase that tag; do not mint 14.1.x while iterating)
- [x] Roll/chat audit on 14.367 (`mausritter-qa`)
- [x] Empty second weapon die no longer crashes `rollWeapon`
- [x] Spell chat shows Sum + dice instead of `12|3`
- [x] Weather/hex chat uses the Mausritter header, not Foundry Amiri `h2`
- [x] Chat cards attach Foundry rolls (native dice tooltip)
- [x] Advantage keeps low, disadvantage keeps high
- [x] Table result rows no longer store `d20-black.svg`
