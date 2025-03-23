
import React from 'react';
import GlassCard from './GlassCard';
import { ChevronRight, Dumbbell, HeartHandshake, Activity, CalendarClock } from 'lucide-react';
import AnimatedText from './AnimatedText';

const Services: React.FC = () => {
  const services = [
    {
      title: "1:1 Personal Training",
      icon: Dumbbell,
      description: "Personalized training sessions tailored to your specific goals, fitness level, and preferences.",
      features: ["Customized workout plans", "Form correction & technique", "Progress tracking", "Flexible scheduling"],
      highlighted: true,
      price: "$120",
      duration: "per session"
    },
    {
      title: "Online Coaching",
      icon: Activity,
      description: "Remote coaching with regular check-ins and adjustments based on your progress and feedback.",
      features: ["Weekly program updates", "Nutrition guidance", "24/7 messaging support", "Video form checks"],
      highlighted: false,
      price: "$299",
      duration: "per month"
    },
    {
      title: "Group Training",
      icon: HeartHandshake,
      description: "High-energy group sessions combining strength, conditioning, and team motivation.",
      features: ["Small groups (max 6)", "Varied workouts", "Community support", "Competitive environment"],
      highlighted: false,
      price: "$199",
      duration: "per month"
    },
    {
      title: "Custom Programs",
      icon: CalendarClock,
      description: "Fully periodized training programs designed for specific goals without ongoing coaching.",
      features: ["8-12 week timeline", "Exercise library access", "Progression model", "One-time consultation"],
      highlighted: false,
      price: "$199",
      duration: "one-time"
    }
  ];

  return (
    <section id="services" className="section-padding bg-sinner-dark-gray noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR <span className="text-sinner-blue">PROGRAMS</span></h2>
          <AnimatedText 
            text="Transformative fitness solutions designed to push you beyond your limits." 
            className="text-lg text-white/80"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <GlassCard 
              key={index}
              className={`h-full flex flex-col ${service.highlighted ? 'border-sinner-red' : 'border-white/10'}`}
              hoverEffect={true}
            >
              <div className="mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  service.highlighted ? 'bg-sinner-red' : 'bg-sinner-blue/20'
                }`}>
                  <service.icon className={`h-6 w-6 ${
                    service.highlighted ? 'text-white' : 'text-sinner-blue'
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
                    <span className="block text-2xl font-bold">{service.price}</span>
                    <span className="text-white/60 text-sm">{service.duration}</span>
                  </div>
                  <a 
                    href="#contact" 
                    className={`text-sm font-semibold py-2 px-4 rounded ${
                      service.highlighted 
                        ? 'bg-sinner-red hover:bg-sinner-red/90' 
                        : 'bg-white/10 hover:bg-white/20'
                    } transition-colors`}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-sinner-red/20 via-sinner-red/10 to-sinner-red/5 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">Not sure which program is right for you?</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Schedule a free 15-minute consultation call to discuss your goals and find the perfect fit for your fitness journey.
          </p>
          <a href="#contact" className="btn-primary inline-flex">
            Book Free Consultation
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
