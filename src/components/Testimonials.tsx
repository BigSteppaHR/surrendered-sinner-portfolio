
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import GlassCard from './GlassCard';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Alex M.",
      role: "Powerlifter",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      quote: "Surrendered Sinner Fitness completely transformed my approach to strength training. In just 6 months, I added 100lbs to my deadlift and 70lbs to my squat. The programming is intense but incredibly effective.",
      rating: 5
    },
    {
      name: "Sarah K.",
      role: "CrossFit Athlete",
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      quote: "The online coaching program gave me the structure and accountability I needed to take my performance to the next level. The coaches are responsive, knowledgeable, and truly care about your progress.",
      rating: 5
    },
    {
      name: "Mark D.",
      role: "Former Athlete",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      quote: "After years of struggling with inconsistent training and plateaus, Surrendered Sinner provided the guidance I needed. Their no-nonsense approach and attention to detail helped me reclaim the strength I had in my 20s.",
      rating: 5
    },
    {
      name: "Jessica T.",
      role: "Fitness Competitor",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80",
      quote: "The personalized attention and expert guidance from my coach has been invaluable in my competition prep. They've helped me achieve a physique I never thought possible while maintaining my strength.",
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
    <section id="testimonials" className="section-padding noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6"><span className="text-sinner-red">SUCCESS</span> STORIES</h2>
          <p className="text-lg text-white/80">
            Real results from real people who trusted our process and pushed beyond their limits.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="flex overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <GlassCard className="p-0 overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-2/5">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                            className="w-full h-full object-cover aspect-square"
                          />
                        </div>
                        <div className="md:w-3/5 p-8 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <Quote className="w-10 h-10 text-sinner-red opacity-50" />
                              <div className="flex">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-lg mb-6 italic text-white/90">{testimonial.quote}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-xl">{testimonial.name}</h4>
                            <p className="text-white/70">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={prevTestimonial} 
              className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus:outline-none z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextTestimonial} 
              className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus:outline-none z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-sinner-red' : 'bg-white/30'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to Write Your Success Story?</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join the ranks of those who've transformed their bodies and mindsets through our proven programs.
          </p>
          <a href="#contact" className="btn-secondary inline-flex">
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
