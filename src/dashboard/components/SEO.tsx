import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  noindex?: boolean;
}

export function SEO({ 
  title, 
  description, 
  keywords,
  ogImage = 'https://www.viszmo.com/viszmofull.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  noindex
}: SEOProps) {
  const fullTitle = title.includes('Viszmo') ? title : `${title} | Viszmo`;

  // Determine noindex: default to true for dashboard routes, false for marketing pages
  const isDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');
  const shouldNoIndex = noindex !== undefined ? noindex : isDashboard;

  const robotsContent = shouldNoIndex ? 'noindex, nofollow' : 'index, follow';
  const resolvedCanonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : undefined);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}
    </Helmet>
  );
}
