
import React from 'react';
import { ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-black py-12 relative noise-bg">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
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
          
          <div>
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
          
          <div>
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
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            Designed with <span className="text-sinner-red">♥</span> for those who push limits
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Terms of Service</a>
            <button
              onClick={scrollToTop}
              className="bg-sinner-red text-white p-2 rounded-full hover:bg-sinner-red/90 transition-colors focus:outline-none"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
