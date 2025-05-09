
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import GlassCard from './GlassCard';
import { useIsMobile } from '@/hooks/use-mobile';

const Testimonials: React.FC = () => {
  const isMobile = useIsMobile();
  const testimonials = [
    {
      name: "Mike T.",
      role: "IFBB Pro Bodybuilder",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      quote: "Surrendered Sinner Fitness helped me break through my plateau before my last competition. Their nutrition protocol and training splits were exactly what I needed to dial in my physique. Added 15 pounds of stage weight while staying lean. Worth every penny.",
      rating: 5
    },
    {
      name: "Emily R.",
      role: "Fitness Influencer & Coach",
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      quote: "As someone who coaches others, I needed expert guidance to take my own training to the next level. Their programming is brutal but absolutely effective. My deadlift went from 285 to 365 in just 16 weeks, and my content has blown up showing the transformation.",
      rating: 5
    },
    {
      name: "Chris L.",
      role: "CrossFit Box Owner",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      quote: "I've worked with a lot of program designers in the fitness industry, and Surrendered Sinner stands apart. Their approach to progressive overload and recovery protocols has completely changed how I program for myself and my athletes. Functional strength through the roof.",
      rating: 5
    },
    {
      name: "Jessica T.",
      role: "Mother of 3, Office Manager",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80",
      quote: "After having my third child, I thought I'd never get back in shape. The customized nutrition plan and at-home workout program fit perfectly into my busy schedule. I've lost 35 pounds in 6 months and have more energy than I've had in years. My only regret is not starting sooner.",
      rating: 5
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="section-padding py-16 md:py-20 bg-gradient-to-b from-black to-sinner-dark-gray noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-6"><span className="text-sinner-red">SUCCESS</span> STORIES</h2>
          <p className="text-sm md:text-lg text-white/80">
            Real results from real people who trusted our process and pushed beyond their limits.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-0 sm:px-4">
                    <GlassCard className="p-0 overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Mobile-optimized image */}
                        <div className={`${isMobile ? 'h-40' : 'md:w-2/5'}`}>
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                            className={`w-full h-full object-cover ${isMobile ? 'aspect-[4/3]' : 'aspect-square'}`}
                          />
                        </div>
                        <div className={`${isMobile ? 'p-4' : 'md:w-3/5 p-6'} flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-start mb-2 md:mb-4">
                              <Quote className="w-6 h-6 md:w-8 md:h-8 text-sinner-red opacity-50" />
                              <div className="flex">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <svg key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className={`${isMobile ? 'text-xs leading-tight' : 'text-sm md:text-base'} mb-3 md:mb-6 italic text-white/90`}>
                              {testimonial.quote}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm md:text-lg">{testimonial.name}</h4>
                            <p className="text-xs md:text-sm text-white/70">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Improved mobile navigation buttons */}
            <button 
              onClick={prevTestimonial} 
              className="absolute top-1/2 -left-1 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 md:p-2 transition-colors focus:outline-none z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <button 
              onClick={nextTestimonial} 
              className="absolute top-1/2 -right-1 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 md:p-2 transition-colors focus:outline-none z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          
          {/* Improved indicator dots for mobile */}
          <div className="flex justify-center mt-2 md:mt-4 space-x-1.5">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-sinner-red' : 'bg-white/30'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile optimized CTA section */}
        <div className="mt-8 md:mt-16 text-center">
          <h3 className="text-lg md:text-2xl font-bold mb-2">Ready to Write Your Success Story?</h3>
          <p className="text-xs md:text-base text-white/80 mb-4 md:mb-6 max-w-2xl mx-auto">
            Join the ranks of those who've transformed their bodies and mindsets through our proven programs.
          </p>
          <a href="#contact" className="btn-primary pulse-glow inline-flex text-xs md:text-base px-4 py-2 md:px-6 md:py-3">
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
