#!/usr/bin/env python3
"""Record the real dependencies of a freshly built document.

LaTeX knows exactly which files it read: ``pdflatex -recorder`` writes an
``.fls`` file listing every INPUT it opened, which picks up ``\\input`` files,
figures and style files without anyone having to enumerate them.  Two things
the ``.fls`` does not cover, handled here as well:

* ``.bib`` files, because pdflatex reads the generated ``.bbl``, never the
  bibliography source.  The ``.aux`` records those as ``\\bibdata`` entries.
* Markdown sources, because pandoc runs the PDF engine in a temporary
  directory and discards the ``.fls``.  For those we fall back to scanning the
  Markdown for local file references.  Anything missed there is still caught by
  the "unknown file changed -> rebuild everything" rule in select_docs.py.

Usage:  record_deps.py <source> <manifest.json> [repo_root]
"""

import json
import os
import re
import sys

# Artifacts LaTeX generates for itself; they are outputs, not real inputs.
GENERATED_SUFFIXES = {
    ".aux", ".bbl", ".blg", ".fls", ".log", ".out", ".toc", ".lof", ".lot",
    ".nav", ".snm", ".vrb", ".fdb_latexmk", ".synctex.gz", ".spl", ".bcf",
    ".run.xml",
}

MD_REFERENCE_RE = re.compile(
    r"""!\[[^\]]*\]\(\s*<?([^)\s>]+)>?[^)]*\)"""   # ![alt](path)
    r"""|\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}"""  # raw LaTeX in md
    r"""|^\s*!include\s+(\S+)""",                   # include extension
    re.MULTILINE,
)


def repo_relative(path, repo_root):
    """Normalise *path* to a repo-relative path, or None if outside the repo."""
    absolute = os.path.normpath(os.path.abspath(path))
    root = os.path.normpath(os.path.abspath(repo_root))
    if absolute == root:
        return None
    if not absolute.startswith(root + os.sep):
        return None  # system TeX tree, /usr/share/texlive, etc.
    return os.path.relpath(absolute, root)


def deps_from_fls(fls_path, stem_pdf, repo_root):
    """Parse INPUT lines out of an .fls file."""
    found = set()
    pwd = os.path.dirname(os.path.abspath(fls_path))
    with open(fls_path, "r", errors="replace") as handle:
        for line in handle:
            line = line.rstrip("\n")
            if line.startswith("PWD "):
                pwd = line[4:].strip()
            elif line.startswith("INPUT "):
                raw = line[6:].strip()
                if not raw:
                    continue
                resolved = raw if os.path.isabs(raw) else os.path.join(pwd, raw)
                rel = repo_relative(resolved, repo_root)
                if rel is None:
                    continue
                # Skip LaTeX's own scratch files, but keep figures: a .pdf is
                # only excluded when it is this document's own output.
                _, ext = os.path.splitext(rel)
                if ext in GENERATED_SUFFIXES:
                    continue
                if os.path.normpath(rel) == os.path.normpath(stem_pdf):
                    continue
                found.add(rel)
    return found


def deps_from_aux(aux_path, repo_root):
    """Pull \\bibdata entries (the .bib files) out of an .aux file."""
    found = set()
    if not os.path.exists(aux_path):
        return found
    aux_dir = os.path.dirname(os.path.abspath(aux_path))
    with open(aux_path, "r", errors="replace") as handle:
        text = handle.read()
    for match in re.finditer(r"\\bibdata\{([^}]*)\}", text):
        for entry in match.group(1).split(","):
            entry = entry.strip()
            if not entry:
                continue
            if not entry.endswith(".bib"):
                entry += ".bib"
            rel = repo_relative(os.path.join(aux_dir, entry), repo_root)
            if rel and os.path.exists(os.path.join(repo_root, rel)):
                found.add(rel)
    return found


def deps_from_markdown(md_path, repo_root):
    """Best-effort scan of a Markdown source for local file references."""
    found = set()
    md_dir = os.path.dirname(os.path.abspath(md_path))
    with open(md_path, "r", errors="replace") as handle:
        text = handle.read()
    for match in MD_REFERENCE_RE.finditer(text):
        raw = next((g for g in match.groups() if g), None)
        if not raw or "://" in raw:
            continue  # remote URL, not a build dependency
        rel = repo_relative(os.path.join(md_dir, raw), repo_root)
        if rel and os.path.exists(os.path.join(repo_root, rel)):
            found.add(rel)
    return found


def load_manifest(manifest_path):
    if not os.path.exists(manifest_path):
        return {}
    try:
        with open(manifest_path) as handle:
            return json.load(handle)
    except (ValueError, OSError):
        return {}


def save_manifest(manifest, manifest_path):
    with open(manifest_path, "w") as handle:
        json.dump(manifest, handle, indent=2, sort_keys=True)
        handle.write("\n")


def prune(manifest_path, repo_root):
    """Drop manifest entries whose source document no longer exists."""
    manifest = load_manifest(manifest_path)
    gone = [doc for doc in manifest
            if not os.path.exists(os.path.join(repo_root, doc))]
    for doc in gone:
        del manifest[doc]
        print("record_deps: pruned %s" % doc)
    if gone:
        save_manifest(manifest, manifest_path)
    return len(gone)


def main():
    if len(sys.argv) >= 3 and sys.argv[1] == "--prune":
        manifest_path = sys.argv[2]
        repo_root = sys.argv[3] if len(sys.argv) > 3 else os.getcwd()
        prune(manifest_path, repo_root)
        return

    if len(sys.argv) < 3:
        sys.exit("usage: record_deps.py <source> <manifest.json> [repo_root]\n"
                 "       record_deps.py --prune <manifest.json> [repo_root]")

    source = sys.argv[1]
    manifest_path = sys.argv[2]
    repo_root = sys.argv[3] if len(sys.argv) > 3 else os.getcwd()

    source_rel = repo_relative(source, repo_root)
    if source_rel is None:
        sys.exit("record_deps: %s is outside the repository" % source)

    stem, ext = os.path.splitext(source)
    deps = {source_rel}
    manifest = load_manifest(manifest_path)

    if ext == ".md":
        deps |= deps_from_markdown(source, repo_root)
    else:
        fls = stem + ".fls"
        if os.path.exists(fls):
            deps |= deps_from_fls(fls, stem + ".pdf", repo_root)
        elif source_rel in manifest:
            # No .fls this time (a failed or skipped build). Keep what we
            # already knew rather than degrading the entry to the source
            # alone, which would silently stop rebuilding its dependents.
            print("record_deps: no .fls for %s; keeping previous dependencies"
                  % source_rel)
            return
        else:
            print("record_deps: no .fls for %s; recording source only"
                  % source_rel)
        deps |= deps_from_aux(stem + ".aux", repo_root)

    manifest[source_rel] = sorted(deps)
    save_manifest(manifest, manifest_path)

    print("record_deps: %s -> %d dependencies" % (source_rel, len(deps)))


if __name__ == "__main__":
    main()
