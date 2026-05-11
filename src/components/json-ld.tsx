type JsonValue = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonValue }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a single JSON tree; stringify is safe for our static objects.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
