"""Compatibility launcher for older Blog Poster shortcuts.

The original desktop shortcut used this filename. Keep it as a small forwarder
so pinned shortcuts or saved commands still run the current publisher.
"""

from publish_blog_queue import main


if __name__ == "__main__":
    main()
