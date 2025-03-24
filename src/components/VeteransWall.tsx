
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import GlassCard from './GlassCard';
import { Medal, Flag, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const VeteransWall: React.FC = () => {
  const isMobile = useIsMobile();
  
  const testimonials = [
    {
      name: "Marcus Aurelius",
      role: "Army Veteran",
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      icon: Medal
    },
    {
      name: "Julius Caesar",
      role: "Marine Corps Veteran",
      message: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      icon: Flag
    },
    {
      name: "Cicero",
      role: "Navy Veteran",
      message: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      icon: Shield
    }
  ];

  return (
    <section id="veterans-wall" className="section-padding py-14 md:py-20 bg-gradient-to-b from-sinner-dark-gray to-black noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
            <span className="text-sinner-red">VETERANS</span> SUPPORT WALL
          </h2>
          <p className="text-sm md:text-base text-white/80">
            Honoring those who served with strength and courage. Share your story and connect with fellow veterans.
          </p>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-3 gap-6'} mb-8`}>
          {testimonials.map((item, index) => (
            <Card key={index} className="bg-sinner-dark-gray/50 border-sinner-red/10 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-sinner-red/10 rounded-full p-2 mt-1">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-sinner-red" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm md:text-base">{item.name}</h3>
                    <p className="text-xs md:text-sm text-white/60">{item.role}</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-white/80 italic">{item.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <GlassCard className={`${isMobile ? 'p-4' : 'p-6'} bg-sinner-red/5 max-w-3xl mx-auto`}>
          <div className="text-center">
            <h3 className={`font-bold ${isMobile ? 'text-lg mb-2' : 'text-xl mb-3'}`}>Share Your Story</h3>
            <p className={`text-white/80 ${isMobile ? 'text-xs mb-3' : 'text-sm mb-4'}`}>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Semper risus in hendrerit gravida rutrum.
            </p>
            <Button 
              className="bg-sinner-red hover:bg-sinner-red/90 text-white font-semibold"
              size={isMobile ? "sm" : "default"}
            >
              Submit Your Message
            </Button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default VeteransWall;
