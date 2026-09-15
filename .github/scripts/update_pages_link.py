#!/usr/bin/env python3
"""Point the README's GitHub Pages link at this repository's own page.

The template ships with a link to the template's own page and a comment
asking teams to update it, which is easy to miss.  Since the build already
commits to the repository, it can correct the link itself: every team's
README then links to their documentation rather than to the template's.

Any Markdown link in the README whose target is a github.io address is
treated as the project's Pages link.  Nothing is reported as an error if no
such link exists, because a team is free to reword or remove it.

Usage:  update_pages_link.py <owner/repo> [README.md]
"""

import os
import re
import sys

MARKDOWN_LINK = re.compile(r"(\]\()\s*(https?://[^)\s]*github\.io[^)\s]*)\s*(\))")


def pages_url(slug):
    """The Pages URL for owner/repo, as GitHub serves it."""
    if "/" not in slug:
        raise ValueError("expected owner/repo, got %r" % slug)
    owner, repo = slug.split("/", 1)
    # GitHub serves Pages from a lowercased owner name.
    owner_host = owner.lower() + ".github.io"
    if repo.lower() == owner_host:
        # The owner's user/organisation site is served from the host root.
        return "https://%s/" % owner_host
    return "https://%s/%s/" % (owner_host, repo)


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: update_pages_link.py <owner/repo> [README.md]")

    slug = sys.argv[1]
    readme = sys.argv[2] if len(sys.argv) > 2 else "README.md"
    url = pages_url(slug)

    if not os.path.exists(readme):
        print("update_pages_link: no %s, nothing to do" % readme)
        return

    with open(readme) as handle:
        original = handle.read()

    replaced = []

    def swap(match):
        was = match.group(2)
        if was == url:
            return match.group(0)
        replaced.append(was)
        return match.group(1) + url + match.group(3)

    updated = MARKDOWN_LINK.sub(swap, original)

    if not replaced:
        if url in original:
            print("update_pages_link: %s already points at %s" % (readme, url))
        else:
            print("update_pages_link: no github.io link found in %s" % readme)
        return

    with open(readme, "w") as handle:
        handle.write(updated)

    for was in replaced:
        print("update_pages_link: %s -> %s" % (was, url))


if __name__ == "__main__":
    main()
