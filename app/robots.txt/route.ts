export function GET() {
  const robotsTxt = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/

Sitemap: https://pestournament.ke/sitemap.xml
  `.trim()

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
