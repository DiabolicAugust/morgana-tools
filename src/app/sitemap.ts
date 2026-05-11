import { MetadataRoute } from 'next';
import { getSiteUrl } from '../lib/site';
import { getMaxSearchVolumePriority, TOOLS } from '../lib/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  const maxPriority = Math.max(getMaxSearchVolumePriority(), 1);

  const toolEntries: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${base}/tools/${tool.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority:
      Math.round(
        (0.55 +
          (0.35 * tool.searchVolumePriority) / maxPriority +
          Number.EPSILON) *
          100,
      ) / 100,
  }));

  return [
    {
      url: base,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.35,
    },
    ...toolEntries,
  ];
}
