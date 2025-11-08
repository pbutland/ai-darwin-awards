import { getSlug } from './nominees-util.js';
import { getDisplayName, type WinnerInfo, type Nominee } from './results-util.js';

export function generateRSSFeed(nominees: any[], winnerInfo?: WinnerInfo[]) {
  const currentDate = new Date().toUTCString();
  const baseUrl = 'https://aidarwinawards.org';
  
  // Generate winner announcement items
  const winnerItems = winnerInfo ? winnerInfo.map(({ year, winnerId, winnerScore }) => {
    const winner = nominees.find((n: any) => n.id === winnerId);
    if (!winner) return '';
    
    const winnerName = getDisplayName(winner);
    const winnersUrl = `${baseUrl}/winners-${year}.html`;
    // Results are always published on February 14th of the following year
    const nextYear = parseInt(year) + 1;
    const pubDate = new Date(`${nextYear}-02-14T00:00:00Z`).toUTCString();
    
    return `
    <item>
      <title><![CDATA[🏆 ${year} AI Darwin Awards Results: ${winnerName} Wins!]]></title>
      <description><![CDATA[The ${year} AI Darwin Awards results are in! ${winnerName} wins with a score of ${winnerScore}. View the complete breakdown and full analysis.]]></description>
      <link>${winnersUrl}</link>
      <guid isPermaLink="true">${winnersUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>Results</category>
    </item>`;
  }).join('') : '';
  
  // Generate nominee items
  const rssItems = nominees
    .sort((a, b) => new Date(b.reportedDate || '2025-01-01').getTime() - new Date(a.reportedDate || '2025-01-01').getTime())
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
      <title><![CDATA[[${badge}] ${nominee.title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${nomineeUrl}</link>
      <guid isPermaLink="true">${nomineeUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${badge}</category>
    </item>`;
    }).join('');

  // Combine winner announcements and nominee items
  const allItems = winnerItems + rssItems;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Darwin Awards - Nominees &amp; Results</title>
    <description>Latest nominees and annual results for the most spectacular AI failures and misadventures. Updates as new incidents are submitted and verified.</description>
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
    </image>${allItems}
  </channel>
</rss>`;
}
