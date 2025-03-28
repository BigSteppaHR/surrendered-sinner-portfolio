
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Award, Sparkles, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SEO 
        title="About | Surrendered Sinner Fitness" 
        description="Learn about the mission and vision behind Surrendered Sinner Fitness, and meet our certified trainers with ISSA certifications."
      />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-[#ea384c]">Surrendered Sinner Fitness</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Breaking barriers, building strength, and transforming lives through disciplined training and unwavering dedication.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 mb-16">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#ea384c]/20 rounded-lg"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#ea384c]/20 rounded-lg"></div>
                <div className="relative overflow-hidden rounded-lg border-2 border-[#ea384c]/30 shadow-[0_0_15px_rgba(234,56,76,0.2)]">
                  <img 
                    src="https://images.unsplash.com/photo-1606889464198-fcb18894cf50?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    alt="Surrendered Sinner Fitness Gym" 
                    className="w-full h-auto object-cover aspect-[4/3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <Badge className="bg-[#ea384c] mb-2">Our Mission</Badge>
                    <p className="text-white font-semibold">
                      Empowering individuals to reach their highest physical potential through discipline, knowledge, and dedication.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#ea384c]" />
                  Our Certifications
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center bg-zinc-900 p-4 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="https://www.issaonline.com/img/issa-logo.svg" 
                      alt="ISSA Logo" 
                      className="h-16 w-auto mb-3 bg-white p-2 rounded"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Bodybuilding
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center bg-zinc-900 p-4 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="https://www.issaonline.com/img/issa-logo.svg" 
                      alt="ISSA Logo" 
                      className="h-16 w-auto mb-3 bg-white p-2 rounded"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Strength & Conditioning
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center bg-zinc-900 p-4 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="https://www.issaonline.com/img/issa-logo.svg" 
                      alt="ISSA Logo" 
                      className="h-16 w-auto mb-3 bg-white p-2 rounded"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Personal Training
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center bg-zinc-900 p-4 rounded-lg border border-[#ea384c]/20">
                    <img 
                      src="https://www.issaonline.com/img/issa-logo.svg" 
                      alt="ISSA Logo" 
                      className="h-16 w-auto mb-3 bg-white p-2 rounded"
                    />
                    <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30 text-white">
                      Nutrition
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Our Philosophy</h2>
                
                <p className="text-lg leading-relaxed">
                  At Surrendered Sinner Fitness, we believe that true transformation comes through 
                  discipline, consistency, and a willingness to embrace the struggle. Our approach 
                  combines cutting-edge training methodologies with battle-tested principles to forge 
                  not just stronger bodies, but unbreakable mindsets.
                </p>
                
                <p className="text-lg leading-relaxed mt-4">
                  We understand that the path to physical excellence requires sacrifice, but we also 
                  believe that this journey should be personalized to each individual's unique needs and goals. 
                  Whether you're looking to compete at the highest levels or simply improve your health and confidence, 
                  our team is dedicated to guiding you through every step of your fitness journey.
                </p>
                
                <div className="my-8 p-6 bg-zinc-900 rounded-lg border border-[#ea384c]/20">
                  <h3 className="text-xl font-semibold mb-3">The Surrendered Sinner Approach</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-[#ea384c] mr-3 mt-1 flex-shrink-0" />
                      <span><strong className="text-[#ea384c]">Intensity With Purpose:</strong> Every rep, every set has meaning in your transformation journey.</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-[#ea384c] mr-3 mt-1 flex-shrink-0" />
                      <span><strong className="text-[#ea384c]">Consistency Breeds Excellence:</strong> True change comes from showing up daily, not sporadic efforts.</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-[#ea384c] mr-3 mt-1 flex-shrink-0" />
                      <span><strong className="text-[#ea384c]">No Shortcuts:</strong> We embrace the struggle that forges extraordinary results.</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-[#ea384c] mr-3 mt-1 flex-shrink-0" />
                      <span><strong className="text-[#ea384c]">Knowledge Is Power:</strong> Education is the foundation of sustainable fitness success.</span>
                    </li>
                  </ul>
                </div>
                
                <h3 className="text-xl font-semibold mt-8 mb-4 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-[#ea384c]" />
                  Training Specialties
                </h3>
                
                <ul className="list-none space-y-3 mt-4">
                  <li className="flex items-start">
                    <div className="bg-[#ea384c]/20 p-2 rounded mr-3 flex-shrink-0">
                      <Dumbbell className="h-5 w-5 text-[#ea384c]" />
                    </div>
                    <div>
                      <strong>Bodybuilding & Physique Development</strong>
                      <p className="text-gray-400 mt-1">
                        Specialized training for muscle hypertrophy, symmetry, and aesthetic development.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#ea384c]/20 p-2 rounded mr-3 flex-shrink-0">
                      <Dumbbell className="h-5 w-5 text-[#ea384c]" />
                    </div>
                    <div>
                      <strong>Strength Training & Powerlifting</strong>
                      <p className="text-gray-400 mt-1">
                        Progressive programs focused on building maximal strength in the big lifts.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#ea384c]/20 p-2 rounded mr-3 flex-shrink-0">
                      <Dumbbell className="h-5 w-5 text-[#ea384c]" />
                    </div>
                    <div>
                      <strong>Custom Nutrition Planning</strong>
                      <p className="text-gray-400 mt-1">
                        Personalized nutritional strategies to support your specific physique and performance goals.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#ea384c]/20 p-2 rounded mr-3 flex-shrink-0">
                      <Dumbbell className="h-5 w-5 text-[#ea384c]" />
                    </div>
                    <div>
                      <strong>Contest Preparation</strong>
                      <p className="text-gray-400 mt-1">
                        Comprehensive coaching for bodybuilding, physique, bikini, and figure competitors.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Alpha Nutrition Supplements</h3>
                <div className="p-6 bg-zinc-900 rounded-lg border border-[#ea384c]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=1470&auto=format&fit=crop" 
                      alt="Alpha Nutrition Labs Supplements" 
                      className="w-full md:w-32 h-auto object-cover rounded-md mb-4 md:mb-0"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg mb-2">Quality supplements designed for optimal performance and results</p>
                    <p className="text-sm text-gray-400">
                      Support your training with our premium, science-backed formulations.
                    </p>
                  </div>
                  <Button 
                    className="bg-[#ea384c] hover:bg-[#c8313f] whitespace-nowrap"
                    onClick={() => window.open('https://alphanutritionlabs.com', '_blank')}
                  >
                    Shop Supplements
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-12 bg-[#333]" />
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Meet the <span className="text-[#ea384c]">Team</span></h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our team of certified professionals is dedicated to helping you achieve your fitness goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 transition-all duration-300 hover:border-[#ea384c]/30 hover:shadow-[0_0_15px_rgba(234,56,76,0.1)]">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1374&auto=format&fit=crop" 
                  alt="Trainer" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">John Doe</h3>
                <p className="text-[#ea384c] mb-4">Head Coach & Founder</p>
                <p className="text-gray-300 mb-4">
                  ISSA Certified Personal Trainer with over 10 years of experience in strength and conditioning.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Bodybuilding</Badge>
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Nutrition</Badge>
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Contest Prep</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 transition-all duration-300 hover:border-[#ea384c]/30 hover:shadow-[0_0_15px_rgba(234,56,76,0.1)]">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop" 
                  alt="Trainer" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Sarah Johnson</h3>
                <p className="text-[#ea384c] mb-4">Nutrition & Fitness Coach</p>
                <p className="text-gray-300 mb-4">
                  Specialized in creating personalized nutrition plans and comprehensive fitness strategies.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Nutrition</Badge>
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Weight Loss</Badge>
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Lifestyle</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 transition-all duration-300 hover:border-[#ea384c]/30 hover:shadow-[0_0_15px_rgba(234,56,76,0.1)]">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop" 
                  alt="Trainer" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Mike Anderson</h3>
                <p className="text-[#ea384c] mb-4">Strength Coach</p>
                <p className="text-gray-300 mb-4">
                  Powerlifting specialist with expertise in maximal strength development and performance.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Powerlifting</Badge>
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Strength</Badge>
                  <Badge variant="outline" className="bg-[#ea384c]/10 border-[#ea384c]/30">Performance</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 p-8 bg-gradient-to-br from-zinc-900 to-black rounded-lg border border-[#333] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Fitness Journey?</h3>
              <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
                Join Surrendered Sinner Fitness today and experience the difference of personalized coaching, 
                expert guidance, and a community dedicated to your success.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  className="bg-[#ea384c] hover:bg-[#c8313f] text-lg py-6 px-8"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact Us
                </Button>
                <Button 
                  variant="outline" 
                  className="border-[#ea384c] text-[#ea384c] hover:bg-[#ea384c]/10 text-lg py-6 px-8"
                  onClick={() => window.location.href = '/plans'}
                >
                  Explore Our Plans
                </Button>
              </div>
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
