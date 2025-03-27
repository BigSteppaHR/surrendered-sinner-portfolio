
import React from 'react';
import { ArrowUp, Facebook, Instagram, Twitter, Youtube, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Social media links
  const socialLinks = [
    { 
      name: 'Facebook', 
      url: 'https://facebook.com/surrenderedsinnerfitness', 
      icon: <Facebook className="h-5 w-5" />,
      color: 'hover:text-blue-600'
    },
    { 
      name: 'Instagram', 
      url: 'https://instagram.com/surrenderedsinnerfitness', 
      icon: <Instagram className="h-5 w-5" />,
      color: 'hover:text-pink-600'
    },
    { 
      name: 'Twitter', 
      url: 'https://twitter.com/surrenderedsinnerfitness', 
      icon: <Twitter className="h-5 w-5" />,
      color: 'hover:text-blue-400'
    },
    { 
      name: 'YouTube', 
      url: 'https://youtube.com/surrenderedsinnerfitness', 
      icon: <Youtube className="h-5 w-5" />,
      color: 'hover:text-red-600'
    }
  ];

  // Brand shop links
  const shopLinks = [
    {
      name: 'Training Gear',
      url: 'https://shop.surrenderedsinnerfitness.com',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      name: 'Supplements',
      url: 'https://supplements.surrenderedsinnerfitness.com',
      icon: <ShoppingBag className="h-5 w-5" />
    }
  ];

  return (
    <footer className="bg-black py-12 relative noise-bg">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <a href="#home" className="flex items-center mb-4">
              <span className="text-xl font-extrabold tracking-tight text-sinner-red">
                SURRENDERED<span className="text-white ml-2">SINNER</span>
              </span>
            </a>
            <p className="text-white/70 mb-4">
              Elite fitness coaching for those ready to push beyond their limits and transform their bodies and minds.
            </p>
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} Surrendered Sinner Fitness. All rights reserved.
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-white/70 hover:text-sinner-red transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="text-white/70 hover:text-sinner-red transition-colors">About</a>
              </li>
              <li>
                <a href="#services" className="text-white/70 hover:text-sinner-red transition-colors">Services</a>
              </li>
              <li>
                <a href="#testimonials" className="text-white/70 hover:text-sinner-red transition-colors">Testimonials</a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-sinner-red transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold mb-4">Shop</h4>
            <ul className="space-y-2">
              {shopLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url} 
                    className="flex items-center text-white/70 hover:text-sinner-red transition-colors"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {link.icon}
                    <span className="ml-2">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold mb-4">Hours</h4>
            <ul className="space-y-2 text-white/70">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span>6:00 AM - 9:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>8:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>8:00 AM - 2:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-6 md:mb-0">
              <TooltipProvider>
                {socialLinks.map((social, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <a 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-white/70 ${social.color} transition-colors p-2 hover:bg-white/5 rounded-full`}
                        aria-label={social.name}
                      >
                        {social.icon}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Follow us on {social.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Terms of Service</a>
              <Button
                onClick={scrollToTop}
                className="bg-sinner-red text-white p-2 rounded-full hover:bg-sinner-red/90 transition-colors focus:outline-none"
                aria-label="Scroll to top"
                size="icon"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
