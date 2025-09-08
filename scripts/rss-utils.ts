import { getSlug } from './nominees-util.js';

export function generateRSSFeed(nominees: any[]) {
  const currentDate = new Date().toUTCString();
  const baseUrl = 'https://aidarwinawards.org';
  const rssItems = nominees
    .sort((a, b) => new Date(b.reportedDate || '2025-01-01').getTime() - new Date(a.reportedDate || '2025-01-01').getTime())
    .slice(0, 20)
    .map(nominee => {
      const slug = nominee.slug || getSlug(nominee);
      const description = nominee.sections && nominee.sections.length > 0
        ? nominee.sections[0].content
        : 'AI Darwin Award nominee details available on the main site.';
      const pubDate = nominee.reportedDate
        ? new Date(nominee.reportedDate).toUTCString()
        : currentDate;
      const nomineeUrl = `${baseUrl}/nominees/${slug}.html`;
      const badge = nominee.badge || 'Unverified';
      return `
    <item>
      <title><![CDATA[${nominee.title}]]></title>
      <description><![CDATA[
        <p><strong>Category:</strong> ${nominee.category}</p>
        <p><strong>Reported by:</strong> ${nominee.reportedBy}</p>
        <p>${description}</p>
        <p><a href="${nomineeUrl}">Read full details</a></p>
      ]]></description>
      <link>${nomineeUrl}</link>
      <guid isPermaLink="true">${nomineeUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${badge}</category>
    </item>`;
    }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Darwin Awards 2025 - New Nominees</title>
    <description>Latest nominees for the most spectacular AI failures and misadventures of 2025. Updates as new incidents are submitted and verified.</description>
    <link>${baseUrl}/nominees-2025.html</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <managingEditor>contact@aidarwinawards.org (AI Darwin Awards)</managingEditor>
    <webMaster>contact@aidarwinawards.org (AI Darwin Awards)</webMaster>
    <image>
      <url>${baseUrl}/images/aidarwinawards-logo.svg</url>
      <title>AI Darwin Awards</title>
      <link>${baseUrl}/</link>
      <width>144</width>
      <height>144</height>
    </image>${rssItems}
  </channel>
</rss>`;
}
