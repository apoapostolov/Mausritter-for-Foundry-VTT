# Mausritter 14.0.1

14.0.0 is the frozen Foundry v14 cut. Work below is unreleased.

## QA 2026-09-10 (mausritter-qa, core 14.367, system 14.0.0, GM)

Passed:
- Gallery grid 150/100/50, 133px squares, confirm overlay moves, confirm writes `actor.img`, close works
- Real click: gallery glyph opens picker; portrait click opens FilePicker (no Tokenizer)
- Portrait persists across reload
- Hireling and creature sheets have FilePicker only
- Manifest 300/300, no orphans; sample PNGs 200x200 HTTP 200
- Occupied inventory slot rejects the drop (Axe stayed)
- Gear pack entries still point at the redrawn custom icon files
- No pageErrors on gallery/sheet/reload

Not run:
- Player (non-owner) permission path: world has GM only. Code rejects `!actor.isOwner`.
- Full pointer drag of inventory cards
- Clean-world install from the GitHub zip
- Two-client socket

## Portrait gallery
- [x] Tokenizer stays off the character sheet; FilePicker remains the custom-art fallback
- [x] Full 300 eyeball audit in the gallery UI (Apo)
- [ ] Hireling / creature portraits if those should share the gallery

## Still open
- [ ] Gear icon cache: hard-refresh leftover pack thumbnails if a browser still shows old art
- [ ] Any post-cut sheet, snap, or chat bugs found in play
