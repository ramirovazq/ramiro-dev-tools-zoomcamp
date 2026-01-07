#!/usr/bin/env python3
"""Itera archivos .zip en un directorio y lista solo archivos .md/.mdx
Además devuelve el nombre con la primera parte del path eliminada.
Ejemplo: "fastmcp-main/docs/.../welcome.mdx" -> "docs/.../welcome.mdx".
"""
from pathlib import Path
import zipfile
import argparse
import re
import posixpath


def strip_first_component(path: str) -> str:
    p = path.lstrip('/')
    parts = p.split('/', 1)
    return parts[1] if len(parts) > 1 else p


def process_zip_file(zip_path: Path):
    matches = []
    with zipfile.ZipFile(zip_path, 'r') as z:
        for name in z.namelist():
            if name.endswith('/'):
                continue
            lname = name.lower()
            if lname.endswith('.md') or lname.endswith('.mdx'):
                try:
                    raw = z.read(name)
                    content = raw.decode('utf-8')
                except Exception:
                    # fall back to bytes representation if decoding fails
                    content = z.read(name)
                matches.append({'original': name, 'filename': strip_first_component(name), 'content': content})
    return matches


def process_directory(directory: Path):
    directory = directory.resolve()
    results = {}
    for zip_path in directory.glob('*.zip'):
        results[zip_path.name] = process_zip_file(zip_path)
    return results


def resolve_md_references(entries: list, max_depth: int = 5) -> list:
    """Replace entries whose content is a simple reference to another .md/.mdx
    (e.g. "../AGENTS.md" or "AGENTS.md") with the actual content from the
    referenced entry found in the same list. Returns the modified entries
    (in-place) after attempting to resolve references up to `max_depth`.
    """
    if not entries:
        return entries

    orig_map = {e['original']: e for e in entries}
    fname_map = {e['filename']: e for e in entries}

    ref_re = re.compile(r'^[\./A-Za-z0-9_\-]+\.mdx?$', re.IGNORECASE)

    def find_entry_by_path(resolved_path: str):
        # try exact original match
        if resolved_path in orig_map:
            return orig_map[resolved_path]
        # try filename (first component stripped)
        stripped = strip_first_component(resolved_path)
        if stripped in fname_map:
            return fname_map[stripped]
        # fallback: search by ending name
        for e in entries:
            if e['original'].endswith(resolved_path) or e['original'].endswith('/' + resolved_path):
                return e
            if e['filename'].endswith(resolved_path) or e['filename'].endswith('/' + resolved_path):
                return e
        return None

    def resolve_for_entry(entry, depth=0):
        if depth >= max_depth:
            return entry.get('content')
        content = entry.get('content')
        if not isinstance(content, str):
            return content
        s = content.strip()
        # Heuristic: content that looks like a single relative md/mdx path
        if not ref_re.match(s):
            return content

        base = posixpath.dirname(entry['original'])
        resolved = posixpath.normpath(posixpath.join(base, s))

        target = find_entry_by_path(resolved)
        if not target:
            return content
        # if target content is another reference, resolve recursively
        t_content = target.get('content')
        if isinstance(t_content, str) and ref_re.match(t_content.strip()):
            # avoid infinite loops via depth
            real = resolve_for_entry(target, depth + 1)
        else:
            real = t_content
        return real

    for e in entries:
        try:
            newc = resolve_for_entry(e, 0)
            e['content'] = newc
        except Exception:
            # on any error, leave original content
            pass

    return entries


def main():
    parser = argparse.ArgumentParser(description='Procesar zips y listar .md/.mdx con ruta ajustada')
    parser.add_argument('dir', nargs='?', default='.', help='Directorio con archivos .zip')
    args = parser.parse_args()

    results = process_directory(Path(args.dir))
    for archive, entries in results.items():
        print(f'Archivo: {archive}')
        if not entries:
            print('  (sin archivos .md/.mdx)')
            continue
        # intentar resolver referencias simples a otros .md/.mdx
        try:
            resolved = resolve_md_references(entries)
        except Exception:
            resolved = entries
        print(resolved)

if __name__ == '__main__':
    main()
