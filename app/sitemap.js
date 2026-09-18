export default function sitemap() {
  const base = "https://school-management-system-six-blond.vercel.app";
  return [
    {
      url: `${base}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
