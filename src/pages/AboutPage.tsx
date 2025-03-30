
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Award, Sparkles, Star, Users } from 'lucide-react';
import SEO from '@/components/SEO';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SEO 
        title="About Brad | Alpha Nutrition & Fitness" 
        description="Learn about Brad, certified personal trainer with ISSA certifications in bodybuilding, strength and conditioning, and functional training."
      />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            About <span className="text-[#ea384c]">Brad</span>
          </h1>
          
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden border-2 border-[#ea384c]/30 shadow-[0_0_15px_rgba(234,56,76,0.2)]">
                <img 
                  src="/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png" 
                  alt="Brad - Fitness Coach" 
                  className="w-full h-auto"
                />
              </div>
              
              <div className="mt-6 flex flex-col gap-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#ea384c]" />
                  Certifications
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-col items-center bg-zinc-900 p-3 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="/lovable-uploads/dad61b9e-a273-48d8-8d79-5c7e30d99564.png" 
                      alt="ISSA Logo" 
                      className="h-12 w-auto mb-2"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Bodybuilding
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center bg-zinc-900 p-3 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="/lovable-uploads/dad61b9e-a273-48d8-8d79-5c7e30d99564.png" 
                      alt="ISSA Logo" 
                      className="h-12 w-auto mb-2"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Strength & Conditioning
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center bg-zinc-900 p-3 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="/lovable-uploads/dad61b9e-a273-48d8-8d79-5c7e30d99564.png" 
                      alt="ISSA Logo" 
                      className="h-12 w-auto mb-2"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Personal Training
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center bg-zinc-900 p-3 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="/lovable-uploads/dad61b9e-a273-48d8-8d79-5c7e30d99564.png" 
                      alt="ISSA Logo" 
                      className="h-12 w-auto mb-2"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Functional Training
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed">
                  Brad is a dedicated fitness professional with extensive experience in personal training, 
                  nutrition coaching, and athletic development. With multiple ISSA certifications in 
                  bodybuilding, strength and conditioning, personal training, and functional training,
                  Brad brings comprehensive expertise to help clients achieve their fitness goals.
                </p>
                
                <p className="text-lg leading-relaxed mt-4">
                  As an <span className="text-[#ea384c] font-semibold">Alpha Nutrition</span> sponsored athlete, Brad combines his passion for fitness with 
                  cutting-edge nutritional science to deliver holistic training and nutrition programs 
                  tailored to individual needs and goals.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-[#ea384c]" />
                  Training Philosophy
                </h3>
                
                <p className="text-lg leading-relaxed">
                  Brad believes in a balanced approach to fitness that combines scientific principles 
                  with practical application. His training methodology focuses on progressive overload, 
                  functional movement patterns, and nutritional optimization to help clients transform 
                  their physiques and improve overall health.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#ea384c]" />
                  Specialties
                </h3>
                
                <ul className="list-none space-y-2 mt-2">
                  <li className="flex items-start">
                    <Star className="h-5 w-5 text-[#ea384c] mr-2 mt-1 flex-shrink-0" />
                    <span>Body transformation and contest preparation</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 text-[#ea384c] mr-2 mt-1 flex-shrink-0" />
                    <span>Strength development and powerlifting</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 text-[#ea384c] mr-2 mt-1 flex-shrink-0" />
                    <span>Customized nutrition plans for performance and aesthetics</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 text-[#ea384c] mr-2 mt-1 flex-shrink-0" />
                    <span>Online coaching and remote program design</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 text-[#ea384c] mr-2 mt-1 flex-shrink-0" />
                    <span>Functional training for athletic performance</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#ea384c]" />
                  Athletes Fueled by Alpha Nutrition
                </h3>
                <div className="p-4 bg-zinc-900 rounded-lg border border-[#ea384c]/20 flex items-center justify-between">
                  <div>
                    <p className="text-lg">Check out ALPHA'S premium nutrition supplements:</p>
                    <p className="text-sm text-gray-400 mt-1">Quality supplements designed for optimal performance and results</p>
                  </div>
                  <a 
                    href="https://alphanutritionlabs.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#ea384c] text-white rounded-md hover:bg-[#c8313f] transition-colors"
                  >
                    Visit Store
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-zinc-900/50 p-6 rounded-lg border border-[#ea384c]/20">
            <h2 className="text-2xl font-bold mb-4 text-center">Elite Athletes Powered By <span className="text-[#ea384c]">Alpha Nutrition</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-[#ea384c]/30 overflow-hidden mb-4">
                    <img
                      src="/placeholder.svg"
                      alt={`Alpha Athlete ${item}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">Athlete Name</h3>
                  <p className="text-gray-400 text-center mt-1">Professional Bodybuilder</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Separator className="bg-[#333]" />
      <Footer />
    </div>
  );
};

export default AboutPage;
