#!/usr/bin/env python3
"""Build the index page listing the generated PDFs.

Each entry carries the time its PDF was last updated, so a reader can tell at
a glance whether what they are looking at reflects the latest source.  That
time comes from git, not the file's mtime: the PDFs are restored from a cache
or checked out fresh, so their mtimes are the time of the run rather than the
time the document last changed.

Usage:  build_index.py --public public --template site/index.html \
                       --output public/index.html [--tracked-dir pdfs]
"""

import argparse
import datetime
import os
import subprocess
import sys

PDF_LIST_MARKER = "<!-- PDF_LIST -->"
GENERATED_MARKER = "<!-- GENERATED -->"

# The documents are listed in waterfall order, which is not the order in which
# the course creates them: the V&V plan is written before the design, but is
# read after it.  Listing them this way reinforces the rational design process
# the course asks students to fake, and makes the documentation easier to
# follow for a reader from outside the course.
#
# Taken from the Final Documentation (Revision 1) list in the course outline.
# A directory not named here is listed after these, alphabetically, so adding
# a document folder cannot make it disappear from the page.
SECTION_ORDER = [
    ("ProblemStatementAndGoals", "Problem Statement and Goals"),
    ("DevelopmentPlan", "Development Plan"),
    ("SRS", "Requirements (SRS)"),
    ("SRS-Volere", "Requirements, Volere template"),
    ("SRS-Meyer", "Requirements, Meyer template"),
    ("HazardAnalysis", "Hazard Analysis"),
    ("Design", "Design"),
    ("VnVPlan", "Verification and Validation Plan"),
    ("VnVReport", "Verification and Validation Report"),
    ("UserGuide", "User Guide"),
    ("CDs", "Custom Documents"),
    ("ReflectAndTrace", "Reflection and Traceability"),
    ("projMngmnt", "Project Management"),
    ("Checklists", "Checklists"),
]

# Within a section, documents that should not be alphabetical.  The checklists
# mirror the deliverables, so they follow the same order as the sections above;
# the design documents go architecture first, then detailed design.
FILE_ORDER = {
    "Checklists": [
        "GettingStarted-Checklist.pdf",
        "ProbState-Checklist.pdf",
        "DevPlan-Checklist.pdf",
        "SRS-Checklist.pdf",
        "SRS-SciComp-Checklist.pdf",
        "HA-Checklist.pdf",
        "MG-Checklist.pdf",
        "MIS-Checklist.pdf",
        "VnV-Checklist.pdf",
        "POC-Checklist.pdf",
        "Code-Checklist.pdf",
        "Writing-Checklist.pdf",
        "FinalDoc-Checklist.pdf",
    ],
    "Design": ["MG.pdf", "MIS.pdf"],
    # The requirements document first, then the questions about it.
    "SRS": ["SRS.pdf", "SRS-FAQ.pdf"],
    # Chronological: proof of concept, then revision 0, then final.
    "projMngmnt": [
        "POC_Productivity_Rep.pdf",
        "Rev0_Productivity_Rep.pdf",
        "Final_Productivity_Rep.pdf",
    ],
}


def section_rank(directory):
    """Position of a section, with unlisted ones sorted after the known ones."""
    for index, (name, _title) in enumerate(SECTION_ORDER):
        if name == directory:
            return (0, index, "")
    return (1, 0, directory.lower())


def section_title(directory):
    for name, title in SECTION_ORDER:
        if name == directory:
            return title
    return directory


def file_rank(directory, filename):
    order = FILE_ORDER.get(directory)
    if order and filename in order:
        return (0, order.index(filename), "")
    return (1, 0, filename.lower())


def git_last_updated(repo_relative_path):
    """Commit time of a path, or None when git knows nothing about it."""
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cI", "--", repo_relative_path],
            capture_output=True, text=True, check=False,
        )
    except OSError:
        return None
    stamp = out.stdout.strip()
    if not stamp:
        return None
    try:
        return datetime.datetime.fromisoformat(stamp)
    except ValueError:
        return None


def as_utc_text(moment):
    return moment.astimezone(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def as_iso(moment):
    return moment.astimezone(datetime.timezone.utc).isoformat()


def time_tag(moment, css_class, prefix=""):
    """A <time> the page's script rewrites into the reader's own timezone.

    The UTC text stays as the element's content so the page still reads
    correctly with JavaScript disabled.
    """
    return ('<time class="%s" datetime="%s" data-prefix="%s">%s%s</time>'
            % (css_class, escape(as_iso(moment)), escape(prefix),
               escape(prefix), escape(as_utc_text(moment))))


def escape(text):
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace('"', "&quot;"))


def collect(public_dir, tracked_dir):
    """Map top-level section -> list of (href, filename, timestamp text)."""
    sections = {}
    for dirpath, _dirnames, filenames in os.walk(public_dir):
        for name in sorted(filenames):
            if not name.endswith(".pdf"):
                continue
            full = os.path.join(dirpath, name)
            href = os.path.relpath(full, public_dir)
            section = href.split(os.sep)[0] if os.sep in href else "General"

            moment = git_last_updated(os.path.join(tracked_dir, href))
            if moment is None:
                # Not committed (a pull request run, say): fall back to the
                # file itself rather than showing nothing.
                moment = datetime.datetime.fromtimestamp(
                    os.path.getmtime(full), datetime.timezone.utc)
            sections.setdefault(section, []).append((href, name, moment))
    return sections


def render(sections):
    lines = []
    for section in sorted(sections, key=section_rank):
        lines.append("<h2>%s</h2>" % escape(section_title(section)))
        lines.append("<ul>")
        entries = sorted(sections[section],
                         key=lambda e: file_rank(section, e[1]))
        for href, name, moment in entries:
            lines.append(
                '  <li><a href="%s">%s</a>%s</li>'
                % (escape(href), escape(name),
                   time_tag(moment, "updated", "updated ")))
        lines.append("</ul>")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--public", default="public")
    parser.add_argument("--template", default="site/index.html")
    parser.add_argument("--output", default="public/index.html")
    parser.add_argument("--tracked-dir", default="pdfs")
    args = parser.parse_args()

    if not os.path.exists(args.template):
        sys.exit("build_index: missing template %s" % args.template)

    sections = collect(args.public, args.tracked_dir)
    if not sections:
        print("build_index: warning, no PDFs found under %s" % args.public,
              file=sys.stderr)

    with open(args.template) as handle:
        page = handle.read()

    if PDF_LIST_MARKER not in page:
        sys.exit("build_index: %s has no %s marker"
                 % (args.template, PDF_LIST_MARKER))

    page = page.replace(PDF_LIST_MARKER, render(sections))
    now = datetime.datetime.now(datetime.timezone.utc)
    page = page.replace(GENERATED_MARKER, time_tag(now, "generated"))
    generated = as_utc_text(now)

    with open(args.output, "w") as handle:
        handle.write(page)

    total = sum(len(v) for v in sections.values())
    print("build_index: %d PDFs in %d sections, generated %s"
          % (total, len(sections), generated))


if __name__ == "__main__":
    main()
