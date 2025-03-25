
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
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Surrendered Sinner Fitness" />
    </Helmet>
  );
};

export default SEO;
