import sys
from pathlib import Path
import zipfile

# allow importing process_zips from the package directory
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import process_zips


def test_strip_first_component_basic():
    assert process_zips.strip_first_component('/a/b/c') == 'b/c'
    assert process_zips.strip_first_component('a/b') == 'b'
    assert process_zips.strip_first_component('single') == 'single'
    assert process_zips.strip_first_component('/single') == 'single'


def test_process_zip_file_filters_and_strips(tmp_path):
    zpath = tmp_path / 'sample.zip'
    with zipfile.ZipFile(zpath, 'w') as z:
        z.writestr('fastmcp-main/README.md', 'x')
        z.writestr('fastmcp-main/docs/Welcome.mdx', 'y')
        z.writestr('fastmcp-main/image.png', 'b')
        z.writestr('README.MD', 'top')
        z.writestr('nested/dir/notes.md', 'n')

    matches = process_zips.process_zip_file(zpath)
    # convert to set of tuples for order-independent comparison
    got = {(m['original'], m['new'], m['content']) for m in matches}
    expected = {
        ('fastmcp-main/README.md', 'README.md', 'x'),
        ('fastmcp-main/docs/Welcome.mdx', 'docs/Welcome.mdx', 'y'),
        ('README.MD', 'README.MD', 'top'),
        ('nested/dir/notes.md', 'dir/notes.md', 'n'),
    }

    assert got == expected


def test_process_directory_collects_per_archive(tmp_path):
    a = tmp_path / 'a.zip'
    b = tmp_path / 'b.zip'
    with zipfile.ZipFile(a, 'w') as z:
        z.writestr('pkg/one.md', '1')
    with zipfile.ZipFile(b, 'w') as z:
        z.writestr('other/file.txt', 'x')

    results = process_zips.process_directory(tmp_path)

    assert 'a.zip' in results
    assert results['a.zip'] == [{'original': 'pkg/one.md', 'new': 'one.md', 'content': '1'}]
    assert 'b.zip' in results
    assert results['b.zip'] == []
