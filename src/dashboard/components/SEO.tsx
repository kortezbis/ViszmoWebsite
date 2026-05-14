import { useEffect } from 'react';

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
  ogImage = '/viszmofull.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  noindex = false 
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    const fullTitle = title.includes('Viszmo') ? title : `${title} | Viszmo`;
    document.title = fullTitle;
    
    const head = document.head;

    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    if (description) setMetaTag('name', 'description', description);
    if (keywords) setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', fullTitle);
    if (description) setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', window.location.href);

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', fullTitle);
    if (description) setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl || !linkCanonical) {
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl || window.location.href);
    }

    return () => {
      // Optional: Cleanup if necessary
    };
  }, [title, description, keywords, ogImage, ogType, twitterCard, canonicalUrl, noindex]);

  return null;
}
