const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const GALLERY_ROOT = "systems/mausritter/images/gallery";
const MANIFEST_URL = `${GALLERY_ROOT}/gallery-manifest.json`;
const LEGACY_ROOT = "systems/mausritter/images/portraits";
const IMAGE_EXT = /\.(png|webp|jpe?g|avif)$/i;
const SECTION_ORDER = ["mice", "clans", "rats"];
const PREFIX_SECTION = { M: "mice", B: "clans", R: "rats" };

export class MausritterPortraitGallery extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["mausritter", "portrait-gallery", "themed", "theme-light"],
    tag: "div",
    window: {
      title: "Maus.PortraitGalleryTitle",
      icon: "fa-solid fa-images",
      resizable: true
    },
    position: { width: 880, height: 760 },
    actions: {
      pick: MausritterPortraitGallery.#onPick
    }
  };

  static PARTS = {
    body: {
      template: "systems/mausritter/templates/apps/portrait-gallery.html",
      scrollable: [".mausritter-portrait-gallery"]
    }
  };

  #actor;
  #selected = null;
  #portraits = [];

  constructor({ actor, ...options } = {}) {
    super({
      id: `mausritter-portrait-gallery-${actor?.id ?? "none"}`,
      ...options
    });
    this.#actor = actor;
  }

  get actor() {
    return this.#actor;
  }

  async _prepareContext() {
    this.#portraits = await listGalleryPortraits();
    const buckets = {
      mice: [],
      clans: [],
      rats: []
    };
    for (const portrait of this.#portraits) {
      const row = {
        ...portrait,
        selected: portrait.src === this.#selected
      };
      (buckets[portrait.section] ?? buckets.mice).push(row);
    }
    const sections = SECTION_ORDER
      .filter((id) => buckets[id].length)
      .map((id) => ({
        id,
        label: game.i18n.localize(sectionLabelKey(id)),
        portraits: buckets[id]
      }));
    return {
      sections,
      empty: this.#portraits.length === 0
    };
  }

  static async #onPick(event, target) {
    event.preventDefault();
    const src = target.dataset.src;
    if (!src) return;
    if (this.#selected === src) {
      await this.#confirm(src);
      return;
    }
    this.#selected = src;
    const root = this.element;
    for (const tile of root.querySelectorAll(".mausritter-portrait-tile.is-selected")) {
      tile.classList.remove("is-selected");
      tile.setAttribute("aria-pressed", "false");
    }
    target.classList.add("is-selected");
    target.setAttribute("aria-pressed", "true");
  }

  async #confirm(src) {
    const actor = this.#actor;
    if (!actor?.isOwner) {
      ui.notifications.warn(game.i18n.localize("Maus.PortraitGalleryNoPermission"));
      return;
    }
    await actor.update({ img: src });
    await this.close();
  }
}

export async function openPortraitGallery(actor) {
  if (!actor) return;
  const existing = foundry.applications.instances.get(`mausritter-portrait-gallery-${actor.id}`);
  if (existing) {
    await existing.render({ force: true });
    existing.bringToFront?.();
    return existing;
  }
  const app = new MausritterPortraitGallery({ actor });
  await app.render({ force: true });
  return app;
}

export async function listGalleryPortraits() {
  const bySrc = new Map();
  await addFromManifest(bySrc);
  await addFromBrowse(bySrc, GALLERY_ROOT);
  if (!bySrc.size) await addFromBrowse(bySrc, LEGACY_ROOT);
  const list = [...bySrc.values()].sort(comparePortraits);
  if (!list.length) {
    list.push({
      id: "sample",
      src: "systems/mausritter/images/sample/Portrait_Mouse.png",
      label: "",
      section: "mice"
    });
  }
  return list;
}

export async function listPortraitSrcs() {
  const portraits = await listGalleryPortraits();
  return portraits.map((row) => row.src);
}

async function addFromManifest(bySrc) {
  try {
    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data)) return;
    for (const entry of data) {
      const src = normalizeSrc(entry?.img || entry?.file);
      if (!src) continue;
      const id = String(entry.id || src.split("/").pop() || src);
      bySrc.set(src, {
        id,
        src,
        label: String(entry.label || ""),
        section: sectionFor(id, entry.group)
      });
    }
  } catch (err) {
    console.debug("Mausritter gallery manifest skipped", err);
  }
}

async function addFromBrowse(bySrc, root) {
  const FilePicker = foundry.applications.apps.FilePicker?.implementation;
  if (!FilePicker?.browse) return;
  try {
    await walkImageDir(FilePicker, root, bySrc);
  } catch (err) {
    console.debug("Mausritter gallery browse skipped", err);
  }
}

async function walkImageDir(FilePicker, path, bySrc) {
  const listing = await FilePicker.browse("data", path);
  for (const file of listing.files ?? []) {
    const src = file.replace(/\\/g, "/");
    if (!IMAGE_EXT.test(src) || bySrc.has(src)) continue;
    const id = src.split("/").pop()?.replace(IMAGE_EXT, "") ?? src;
    bySrc.set(src, {
      id,
      src,
      label: "",
      section: sectionFor(id)
    });
  }
  for (const dir of listing.dirs ?? []) {
    await walkImageDir(FilePicker, dir, bySrc);
  }
}

function normalizeSrc(file) {
  if (typeof file !== "string" || !file) return null;
  const trimmed = file.replace(/\\/g, "/").replace(/^\.\//, "");
  if (IMAGE_EXT.test(trimmed) === false) return null;
  if (trimmed.startsWith("systems/mausritter/")) return trimmed;
  if (trimmed.startsWith("http")) return trimmed;
  return `${GALLERY_ROOT}/${trimmed.replace(/^\/+/, "")}`;
}

function sectionFor(id, group) {
  if (group === "rats") return "rats";
  if (group === "normal") return "mice";
  if (group && group !== "rats" && group !== "normal") return "clans";
  const prefix = String(id).match(/([MBR])\d+/i)?.[1]?.toUpperCase();
  return PREFIX_SECTION[prefix] ?? "mice";
}

function sectionLabelKey(id) {
  if (id === "clans") return "Maus.PortraitGalleryClans";
  if (id === "rats") return "Maus.PortraitGalleryRats";
  return "Maus.PortraitGalleryMice";
}

function comparePortraits(a, b) {
  const sa = SECTION_ORDER.indexOf(a.section);
  const sb = SECTION_ORDER.indexOf(b.section);
  if (sa !== sb) return sa - sb;
  return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
}

