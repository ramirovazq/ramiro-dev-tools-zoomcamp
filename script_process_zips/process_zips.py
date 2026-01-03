#!/usr/bin/env python3
"""Itera archivos .zip en un directorio y lista solo archivos .md/.mdx
Además devuelve el nombre con la primera parte del path eliminada.
Ejemplo: "fastmcp-main/docs/.../welcome.mdx" -> "docs/.../welcome.mdx".
"""
from pathlib import Path
import zipfile
import argparse


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
                matches.append((name, strip_first_component(name)))
    return matches


def process_directory(directory: Path):
    directory = directory.resolve()
    results = {}
    for zip_path in directory.glob('*.zip'):
        results[zip_path.name] = process_zip_file(zip_path)
    return results


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
        for orig, new in entries:
            print(f'  {orig} -> {new}')


if __name__ == '__main__':
    main()
