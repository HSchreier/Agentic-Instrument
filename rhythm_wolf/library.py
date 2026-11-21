"""Pattern library management system."""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict


@dataclass
class PatternMetadata:
    """Pattern metadata for library."""

    id: str
    name: str
    style: str
    tempo: int
    template: str
    tags: List[str]
    description: str
    created_at: str
    updated_at: str
    favorite: bool = False
    plays: int = 0


class PatternLibrary:
    """Manage MIDI pattern library."""

    def __init__(self, library_path: str = "./patterns/library"):
        """Initialize library.

        Args:
            library_path: Base path for pattern storage
        """
        self.library_path = Path(library_path)
        self.library_path.mkdir(parents=True, exist_ok=True)

        # Create category directories
        for category in ["techno", "house", "tech_house", "minimal", "favorites", "backups"]:
            (self.library_path / category).mkdir(exist_ok=True)

        self.metadata_file = self.library_path / "metadata.json"
        self._load_metadata()

    def _load_metadata(self) -> None:
        """Load metadata index from file."""
        if self.metadata_file.exists():
            with open(self.metadata_file) as f:
                self.metadata_index = json.load(f)
        else:
            self.metadata_index = {}

    def _save_metadata(self) -> None:
        """Save metadata index to file."""
        with open(self.metadata_file, "w") as f:
            json.dump(self.metadata_index, f, indent=2)

    def save_pattern(
        self,
        pattern: Dict,
        name: str,
        style: str,
        template: str,
        tags: Optional[List[str]] = None,
        description: str = "",
    ) -> str:
        """Save pattern to library.

        Args:
            pattern: Pattern with metadata and events
            name: Pattern name
            style: Music style
            template: Pattern template
            tags: Optional tags for search
            description: Pattern description

        Returns:
            Pattern ID
        """
        pattern_id = str(uuid.uuid4())[:8]
        now = datetime.now().isoformat()

        # Create metadata
        meta = PatternMetadata(
            id=pattern_id,
            name=name,
            style=style,
            tempo=pattern["metadata"]["tempo"],
            template=template,
            tags=tags or [],
            description=description,
            created_at=now,
            updated_at=now,
        )

        # Save pattern file
        pattern_file = self.library_path / style / f"{pattern_id}.json"
        with open(pattern_file, "w") as f:
            json.dump({
                "metadata": asdict(meta),
                "pattern": pattern,
            }, f, indent=2)

        # Update index
        self.metadata_index[pattern_id] = asdict(meta)
        self._save_metadata()

        return pattern_id

    def get_pattern(self, pattern_id: str) -> Optional[Dict]:
        """Get pattern by ID.

        Args:
            pattern_id: Pattern ID

        Returns:
            Pattern data or None
        """
        if pattern_id not in self.metadata_index:
            return None

        meta = self.metadata_index[pattern_id]
        pattern_file = self.library_path / meta["style"] / f"{pattern_id}.json"

        if not pattern_file.exists():
            return None

        with open(pattern_file) as f:
            return json.load(f)

    def list_patterns(
        self,
        style: Optional[str] = None,
        tag: Optional[str] = None,
        search: Optional[str] = None,
        favorites_only: bool = False,
    ) -> List[PatternMetadata]:
        """List patterns with filtering.

        Args:
            style: Filter by style
            tag: Filter by tag
            search: Search in name/description
            favorites_only: Only show favorites

        Returns:
            List of pattern metadata
        """
        results = []

        for pattern_id, meta in self.metadata_index.items():
            # Apply filters
            if style and meta["style"] != style:
                continue
            if tag and tag not in meta.get("tags", []):
                continue
            if search:
                search_lower = search.lower()
                if search_lower not in meta["name"].lower() and \
                   search_lower not in meta.get("description", "").lower():
                    continue
            if favorites_only and not meta.get("favorite"):
                continue

            results.append(PatternMetadata(**meta))

        # Sort by updated_at (newest first)
        results.sort(key=lambda x: x.updated_at, reverse=True)
        return results

    def delete_pattern(self, pattern_id: str) -> bool:
        """Delete pattern from library.

        Args:
            pattern_id: Pattern ID

        Returns:
            True if deleted, False if not found
        """
        if pattern_id not in self.metadata_index:
            return False

        meta = self.metadata_index[pattern_id]
        pattern_file = self.library_path / meta["style"] / f"{pattern_id}.json"

        # Delete file
        if pattern_file.exists():
            pattern_file.unlink()

        # Update index
        del self.metadata_index[pattern_id]
        self._save_metadata()

        return True

    def toggle_favorite(self, pattern_id: str) -> bool:
        """Toggle favorite status.

        Args:
            pattern_id: Pattern ID

        Returns:
            New favorite status
        """
        if pattern_id not in self.metadata_index:
            return False

        meta = self.metadata_index[pattern_id]
        meta["favorite"] = not meta.get("favorite", False)
        meta["updated_at"] = datetime.now().isoformat()

        self._save_metadata()
        return meta["favorite"]

    def increment_plays(self, pattern_id: str) -> int:
        """Increment play count.

        Args:
            pattern_id: Pattern ID

        Returns:
            New play count
        """
        if pattern_id not in self.metadata_index:
            return 0

        meta = self.metadata_index[pattern_id]
        meta["plays"] = meta.get("plays", 0) + 1
        meta["updated_at"] = datetime.now().isoformat()

        self._save_metadata()
        return meta["plays"]

    def duplicate_pattern(self, pattern_id: str, new_name: str) -> Optional[str]:
        """Duplicate a pattern.

        Args:
            pattern_id: Source pattern ID
            new_name: Name for duplicated pattern

        Returns:
            New pattern ID or None if source not found
        """
        source_pattern = self.get_pattern(pattern_id)
        if not source_pattern:
            return None

        source_meta = self.metadata_index[pattern_id]
        new_id = self.save_pattern(
            pattern=source_pattern["pattern"],
            name=new_name,
            style=source_meta["style"],
            template=source_meta["template"],
            tags=source_meta.get("tags", []),
            description=f"Copy of: {source_meta['description']}",
        )

        return new_id

    def export_pattern(self, pattern_id: str, export_path: str) -> bool:
        """Export pattern as standalone MIDI file.

        Args:
            pattern_id: Pattern ID
            export_path: Path to export to

        Returns:
            True if exported successfully
        """
        pattern = self.get_pattern(pattern_id)
        if not pattern:
            return False

        export_file = Path(export_path)
        export_file.parent.mkdir(parents=True, exist_ok=True)

        with open(export_file, "w") as f:
            json.dump(pattern, f, indent=2)

        return True

    def get_statistics(self) -> Dict:
        """Get library statistics.

        Returns:
            Statistics dict
        """
        stats = {
            "total_patterns": len(self.metadata_index),
            "by_style": {},
            "by_tag": {},
            "total_plays": 0,
            "favorites": 0,
        }

        for meta in self.metadata_index.values():
            # By style
            style = meta["style"]
            stats["by_style"][style] = stats["by_style"].get(style, 0) + 1

            # By tag
            for tag in meta.get("tags", []):
                stats["by_tag"][tag] = stats["by_tag"].get(tag, 0) + 1

            # Totals
            stats["total_plays"] += meta.get("plays", 0)
            if meta.get("favorite"):
                stats["favorites"] += 1

        return stats
