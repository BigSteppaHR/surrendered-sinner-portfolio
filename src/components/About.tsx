
import React from 'react';
import { Dumbbell, Target, Award, HeartPulse } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedText from './AnimatedText';

const About: React.FC = () => {
  const features = [
    {
      icon: Dumbbell,
      title: 'Expert Coaching',
      description: 'Personalized training from certified professionals who understand your unique needs and goals.'
    },
    {
      icon: Target,
      title: 'Results-Driven',
      description: 'Programs designed specifically to maximize your potential and achieve measurable results.'
    },
    {
      icon: Award,
      title: 'Experience',
      description: 'Years of experience helping clients transform their bodies and exceed their fitness aspirations.'
    },
    {
      icon: HeartPulse,
      title: 'Holistic Approach',
      description: 'Balanced focus on training, nutrition, recovery, and mindset to create sustainable change.'
    }
  ];

  const certifications = [
    { name: "ISSA Certified Personal Trainer", logo: "https://www.issaonline.com/img/issa-logo.svg" },
    { name: "ISSA Nutritionist", logo: "https://www.issaonline.com/img/issa-logo.svg" },
    { name: "ISSA Strength & Conditioning Coach", logo: "https://www.issaonline.com/img/issa-logo.svg" }
  ];

  return (
    <section id="about" className="section-padding bg-gradient-to-b from-black to-sinner-dark-gray noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">ABOUT <span className="text-sinner-red">SURRENDERED SINNER</span></h2>
          <p className="text-lg text-white/80">
            We're not just a fitness coaching service - we're a community dedicated to pushing boundaries and transforming lives through disciplined training and relentless determination.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-sinner-red/20 rounded-lg"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-sinner-red/20 rounded-lg"></div>
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1606889464198-fcb18894cf50?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Coach training" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sinner-red/30 to-transparent opacity-60"></div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Our Philosophy</h3>
            <AnimatedText 
              text="At Surrendered Sinner Fitness, we believe in pushing beyond perceived limits and breaking through mental barriers that hold you back." 
              className="text-lg mb-4 text-white/80"
            />
            <p className="text-lg mb-4 text-white/80">
              We combine cutting-edge training methodologies with battle-tested principles to forge not just stronger bodies, but unbreakable mindsets.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-sinner-red/20 p-2 rounded-lg mr-3">
                  <Dumbbell className="h-5 w-5 text-sinner-red" />
                </div>
                <div>
                  <h4 className="font-semibold">Intensity With Purpose</h4>
                  <p className="text-white/70">Every rep, every set has meaning in your transformation journey.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-sinner-red/20 p-2 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-sinner-red" />
                </div>
                <div>
                  <h4 className="font-semibold">Consistency Breeds Excellence</h4>
                  <p className="text-white/70">True change comes from showing up daily, not sporadic efforts.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-sinner-red/20 p-2 rounded-lg mr-3">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">No Shortcuts</h4>
                  <p className="text-white/70">We embrace the struggle that forges extraordinary results.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <a href="#contact" className="btn-primary pulse-glow inline-flex">
                Book Free Consultation
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center">Our <span className="text-sinner-red">Certifications</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <GlassCard 
                key={index} 
                className="p-6 flex flex-col items-center text-center hover:border-sinner-red/50"
                hoverEffect={true}
              >
                <div className="mb-4 w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img src={cert.logo} alt={cert.name} className="w-12 h-12 object-contain" />
                </div>
                <h4 className="font-semibold">{cert.name}</h4>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group" data-aos="fade-up" data-aos-delay={index * 100}>
              <GlassCard 
                className="h-full flex flex-col items-center text-center p-6 transition-all duration-300 hover:border-sinner-red/50" 
                hoverEffect={true}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-sinner-red to-sinner-red/50 text-white">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
