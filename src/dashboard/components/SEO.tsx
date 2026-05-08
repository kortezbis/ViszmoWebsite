import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  noindex?: boolean;
}

export function SEO({ title, description, noindex = true }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Viszmo`;
    
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // Handle Robots indexing
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');

    return () => {
      // Optional: Reset robots on unmount if needed, 
      // but usually the next page's SEO component will handle it.
    };
  }, [title, description, noindex]);

  return null;
}
