import JSZip from 'jszip';

const CBZ_IMG = /\.(png|jpe?g|gif|webp|bmp|avif)$/i;

/** Flatten a CBZ/ZIP comic into a STORE ZIP of ordered raster pages. */
export async function cbzBlobToOrderedPagesZipBlob(blob: Blob): Promise<Blob> {
  const src = await JSZip.loadAsync(blob);
  const dst = new JSZip();
  const paths = Object.keys(src.files)
    .filter((p) => !src.files[p]?.dir && CBZ_IMG.test(p))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (paths.length === 0) {
    throw new Error(
      'No raster images (.png / .jpg / .gif / .webp…) were found inside this ZIP/CBZ.',
    );
  }

  let i = 0;
  for (const p of paths) {
    i += 1;
    const ze = src.files[p];
    if (!ze || ze.dir) continue;
    const u8 = await ze.async('uint8array');
    const base = p.replace(/^.*[/\\]/, '') || `image_${i}`;
    dst.file(`${String(i).padStart(4, '0')}_${base}`, u8);
  }

  return dst.generateAsync({ type: 'blob', compression: 'STORE' });
}

/** Re-pack a Morgana numbered pages ZIP back into comic-style CBZ/ZIP blobs. */
export async function orderedPagesZipBlobToCbzBlob(blob: Blob): Promise<Blob> {
  const src = await JSZip.loadAsync(blob);
  const paths = Object.keys(src.files).filter((p) => {
    const f = src.files[p];
    return f && !f.dir && CBZ_IMG.test(p);
  });

  paths.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (paths.length === 0) {
    throw new Error('No raster images inside this ZIP (expected Morgana-exported comic pages).');
  }

  const dst = new JSZip();
  for (const p of paths) {
    const ze = src.files[p];
    if (!ze || ze.dir) continue;
    const u8 = await ze.async('uint8array');
    const base = p.replace(/^.*[/\\]/, '') || `page_${p}`;
    dst.file(base, u8);
  }

  return dst.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    mimeType: 'application/vnd.comicbook+zip',
  });
}
