#!/usr/bin/env python3
"""Decide which documents need rebuilding, using the recorded dependency graph.

Given the files a push changed, a document is rebuilt when it is itself one of
the changed files, or when the manifest written by record_deps.py says it reads
one of them.  That is what makes a change to a shared include such as
``docs/Common.text`` rebuild all fourteen documents that ``\\input`` it.

The rule is deliberately fail-safe: a changed file that is neither a document,
nor a known dependency, nor explicitly ignorable forces a full rebuild.  A
missing dependency record can therefore make the build slower, never wrong.

Usage:  select_docs.py --changed <files> --deleted <files> [--manifest P] [--root P]
Prints one source path per line on stdout; diagnostics go to stderr.
"""

import argparse
import json
import os
import sys

DOC_SUFFIXES = (".tex", ".md")

# Instructor-owned prose and things this pipeline never builds from.  Changes
# to these must not trigger the full-rebuild fallback.
IGNORED_BASENAMES = {"README.md", "README.txt", ".gitignore"}
IGNORED_PREFIXES = ("pdfs/", "docs/SRS-Meyer/", ".github/")

# Changing how documents are built can change every document, even though no
# document source changed: the package list decides which LaTeX packages are
# available, and the Makefile decides how each document is compiled.  These
# override IGNORED_PREFIXES above.
TOOLCHAIN_PATHS = ("Makefile", ".github/workflows/latex-pages.yml",
                   ".github/scripts/")


def is_document(rel_path):
    """True if this path is a document this pipeline compiles."""
    base = os.path.basename(rel_path)
    if not rel_path.startswith("docs/"):
        return False
    if not rel_path.endswith(DOC_SUFFIXES):
        return False
    if base in IGNORED_BASENAMES or base.startswith("Expectations"):
        return False
    if rel_path.startswith("docs/SRS-Meyer/"):
        return False
    return True


def is_ignorable(rel_path):
    base = os.path.basename(rel_path)
    if base in IGNORED_BASENAMES or base.startswith("Expectations"):
        return True
    return any(rel_path.startswith(p) for p in IGNORED_PREFIXES)


def discover_documents(root):
    """All buildable documents, preferring Foo.md over Foo.tex on a collision.

    This mirrors the Makefile, which lists the Markdown rule first so Markdown
    wins when a folder holds both.
    """
    by_stem = {}
    docs_dir = os.path.join(root, "docs")
    for dirpath, dirnames, filenames in os.walk(docs_dir):
        dirnames[:] = [d for d in dirnames if d != "SRS-Meyer"]
        for name in filenames:
            rel = os.path.relpath(os.path.join(dirpath, name), root)
            if not is_document(rel):
                continue
            stem, ext = os.path.splitext(rel)
            # .md beats .tex for the same target
            if stem not in by_stem or ext == ".md":
                by_stem[stem] = rel
    return set(by_stem.values())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--changed", nargs="*", default=[])
    parser.add_argument("--deleted", nargs="*", default=[])
    parser.add_argument("--manifest", default=".pdf-deps.json")
    parser.add_argument("--root", default=os.getcwd())
    args = parser.parse_args()

    root = os.path.abspath(args.root)
    documents = discover_documents(root)

    manifest = {}
    if os.path.exists(args.manifest):
        try:
            with open(args.manifest) as handle:
                manifest = json.load(handle)
        except (ValueError, OSError) as exc:
            print("select_docs: unreadable manifest (%s)" % exc, file=sys.stderr)

    # Reverse the manifest: dependency -> documents that read it.
    dependents = {}
    for document, deps in manifest.items():
        for dep in deps:
            dependents.setdefault(dep, set()).add(document)

    build = set()
    full_rebuild_reason = None

    if not manifest:
        full_rebuild_reason = "no dependency manifest recorded yet"

    # A document with no manifest entry has never been built and cannot be
    # reasoned about, so it always builds.
    unrecorded = documents - set(manifest)
    if unrecorded:
        build |= unrecorded
        print("select_docs: %d document(s) have no recorded dependencies"
              % len(unrecorded), file=sys.stderr)

    for path in list(args.changed) + list(args.deleted):
        if not path:
            continue
        if path in documents:
            build.add(path)
            continue
        if path.startswith(TOOLCHAIN_PATHS):
            full_rebuild_reason = "build configuration changed: %s" % path
            continue
        if is_ignorable(path):
            print("select_docs: ignoring %s" % path, file=sys.stderr)
            continue
        readers = dependents.get(path)
        if readers:
            hits = readers & documents
            build |= hits
            print("select_docs: %s is read by %d document(s)" % (path, len(hits)),
                  file=sys.stderr)
            continue
        if is_document(path):
            # A document that was deleted; nothing to build for it.
            continue
        full_rebuild_reason = "unrecognised change: %s" % path

    if full_rebuild_reason:
        print("select_docs: full rebuild (%s)" % full_rebuild_reason, file=sys.stderr)
        build = set(documents)

    # Never try to build something that no longer exists.
    build = {p for p in build if os.path.exists(os.path.join(root, p))}

    for path in sorted(build):
        print(path)

    print("select_docs: %d document(s) to build" % len(build), file=sys.stderr)


if __name__ == "__main__":
    main()
