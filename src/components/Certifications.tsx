
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Certifications = () => {
  const certifications = [
    {
      id: 'bodybuilding',
      name: 'ISSA Bodybuilding Certification',
      description: 'Specialized training methodologies for bodybuilding and physique enhancement'
    },
    {
      id: 'strength',
      name: 'ISSA Strength & Conditioning',
      description: 'Performance-focused training for optimal strength and athletic conditioning'
    },
    {
      id: 'personal',
      name: 'ISSA Personal Training',
      description: 'Comprehensive coaching methodologies for individualized fitness guidance'
    },
    {
      id: 'functional',
      name: 'ISSA Functional Training',
      description: 'Movement-based training for improved daily performance and injury prevention'
    }
  ];

  return (
    <section className="py-12 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Professional <span className="text-[#ea384c]">Certifications</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Training with confidence under expert guidance from a coach with multiple recognized certifications from the International Sports Sciences Association (ISSA)
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-8">
          <img 
            src="https://www.issaonline.com/img/issa-logo-white.png" 
            alt="ISSA Logo" 
            className="h-16 mx-auto mb-8"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map(cert => (
            <Card key={cert.id} className="bg-black border-[#333] hover:border-[#ea384c]/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#ea384c]/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-[#ea384c] text-xl font-bold">✓</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{cert.name}</h3>
                  <p className="text-gray-400 text-sm">{cert.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
