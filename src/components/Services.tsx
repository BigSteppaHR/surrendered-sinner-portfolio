
import React from 'react';
import GlassCard from './GlassCard';
import { ChevronRight, Dumbbell, HeartHandshake, Activity, CalendarClock, Utensils } from 'lucide-react';
import AnimatedText from './AnimatedText';
import { useIsMobile } from '@/hooks/use-mobile';

const Services: React.FC = () => {
  const isMobile = useIsMobile();
  
  const services = [
    {
      title: "1:1 Personal Training",
      icon: Dumbbell,
      description: "Personalized training sessions tailored to your specific goals, fitness level, and preferences.",
      features: ["Customized workout plans", "Form correction & technique", "Progress tracking", "Flexible scheduling"],
      highlighted: true,
      showPrice: false,
      price: "",
      duration: "Based on assessment",
      buttonText: "Take Assessment Quiz"
    },
    {
      title: "Nutrition Plan",
      icon: Utensils,
      description: "Comprehensive meal planning designed around your fitness goals and dietary preferences.",
      features: ["Calorie & macro calculations", "Custom meal suggestions", "Grocery shopping lists", "Supplement guidance"],
      highlighted: false,
      showPrice: true,
      price: "$250",
      duration: "one-time",
      buttonText: "Get Started"
    },
    {
      title: "Lifting Programs",
      icon: Activity,
      description: "Structured training programs tailored to your goals, whether building muscle, strength, or athletic performance.",
      features: ["Periodized training cycles", "Exercise progressions", "Video technique guides", "Weekly adjustments"],
      highlighted: false,
      showPrice: true,
      price: "$225",
      duration: "one-time",
      buttonText: "Get Started"
    },
    {
      title: "Complete Package",
      icon: CalendarClock,
      description: "The ultimate transformation package combining personalized lifting program and nutrition guidance.",
      features: ["Custom lifting program", "Detailed nutrition plan", "Email support", "Two bi-weekly check-ins included"],
      highlighted: false,
      showPrice: false,
      price: "",
      duration: "Based on assessment",
      buttonText: "Take Assessment Quiz"
    }
  ];

  return (
    <section id="services" className="section-padding bg-gradient-to-b from-sinner-dark-gray to-black noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR <span className="text-sinner-red">PROGRAMS</span></h2>
          <AnimatedText 
            text="Transformative fitness solutions designed to push you beyond your limits." 
            className="text-lg text-white/80"
          />
          
          {/* Top consultation CTA */}
          <div className="mt-8">
            <a href="#contact" className="btn-primary pulse-glow inline-flex">
              Book Free Consultation
            </a>
          </div>
        </div>

        {/* Services grid - improved mobile layout */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
          {services.map((service, index) => (
            <GlassCard 
              key={index}
              className={`h-full flex flex-col ${service.highlighted ? 'border-sinner-red' : 'border-white/10'}`}
              hoverEffect={true}
            >
              <div className="mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  service.highlighted ? 'bg-sinner-red' : 'bg-sinner-red/20'
                }`}>
                  <service.icon className={`h-6 w-6 ${
                    service.highlighted ? 'text-white' : 'text-white'
                  }`} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-white/70 mb-4">{service.description}</p>
              
              <div className="mt-auto">
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-sinner-red mr-2 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-end justify-between">
                  <div>
                    {service.showPrice ? (
                      <>
                        <span className="block text-2xl font-bold">{service.price}</span>
                        <span className="text-white/60 text-sm">{service.duration}</span>
                      </>
                    ) : (
                      <span className="text-white/60 text-sm">{service.duration}</span>
                    )}
                  </div>
                  <a 
                    href={service.showPrice ? "#contact" : "#assessment-quiz"}
                    className={`text-sm font-semibold py-2 px-4 rounded ${
                      service.highlighted 
                        ? 'bg-sinner-red hover:bg-sinner-red/90 pulse-glow' 
                        : 'bg-sinner-red/80 hover:bg-sinner-red/90'
                    } transition-colors`}
                  >
                    {service.buttonText}
                  </a>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Mobile-optimized call to action */}
        <div className="mt-12 md:mt-16 bg-gradient-to-r from-sinner-red/30 via-sinner-red/20 to-sinner-red/10 rounded-xl p-6 md:p-8 text-center transform hover:scale-[1.01] transition-transform">
          <h3 className="text-xl md:text-2xl font-bold mb-3">Not sure which program is right for you?</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            Schedule a free 15-minute consultation call to discuss your goals and find the perfect fit for your fitness journey.
          </p>
          <a href="#contact" className="btn-primary pulse-glow inline-flex text-sm md:text-base">
            Book Free Consultation
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
