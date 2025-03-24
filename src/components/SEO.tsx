
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Surrendered Sinner Fitness | Elite Personal Training',
  description = 'Transform your body and mind with elite coaching from Surrendered Sinner Fitness. Personalized training programs, nutrition plans, and expert guidance.',
  keywords = 'fitness, personal training, workout plan, nutrition plan, strength training, weight loss, muscle gain, elite coaching',
  canonical = 'https://surrenderedsinnerfitness.com',
  ogImage = '/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png',
  ogType = 'website'
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      <meta charSet="utf-8" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Surrendered Sinner Fitness" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Security Headers */}
      <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'none'" />
      <meta http-equiv="X-Content-Type-Options" content="nosniff" />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Surrendered Sinner Fitness" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
      {/* Cookie Information */}
      <meta name="cookie-policy" content="This site uses essential cookies for authentication. Third-party cookies are used for analytics and may be blocked by your browser." />
      
      {/* Schema.org markup for rich results */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "FitnessCenter",
            "name": "Surrendered Sinner Fitness",
            "description": "${description}",
            "image": "${ogImage}",
            "url": "${canonical}",
            "telephone": "+1-800-FITNESS",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Fitness Street",
              "addressLocality": "Muscle City",
              "addressRegion": "FL",
              "postalCode": "33101",
              "addressCountry": "US"
            },
            "priceRange": "$$",
            "openingHours": "Mo-Fr 06:00-22:00",
            "sameAs": [
              "https://www.facebook.com/surrenderedsinnerfitness",
              "https://www.instagram.com/surrenderedsinnerfitness",
              "https://www.youtube.com/surrenderedsinnerfitness"
            ]
          }
        `}
      </script>
    </Helmet>
  );
};

export default SEO;
