"""Rewrite LevelDB CURRENT files to LF so classic-level can open them on Windows."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "packs"


def main() -> None:
    fixed = 0
    for current in ROOT.glob("*/CURRENT"):
        name = current.read_bytes().replace(b"\r\n", b"\n").replace(b"\r", b"\n")
        if not name.endswith(b"\n"):
            name += b"\n"
        current.write_bytes(name)
        print(f"fixed {current.parent.name}: {name!r}")
        fixed += 1
    print(f"rewrote {fixed} CURRENT files")


if __name__ == "__main__":
    main()
