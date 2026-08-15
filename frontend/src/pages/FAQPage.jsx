import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is Feed Forward?',
          a: 'Feed Forward is a smart food waste redistribution platform that connects food donors with volunteers and redistributes excess food to those in need, prioritizing footpath dwellers, handicapped individuals, orphanages, and old-age homes.',
        },
        {
          q: 'How does the platform work?',
          a: 'Donors post excess food with details and images. Food Quality Checkers inspect the donations at dedicated centers. Once approved, volunteers pick up and deliver the food to high-need areas using optimized routes.',
        },
        {
          q: 'Is the service free?',
          a: 'Yes, Feed Forward is completely free for all users - donors, volunteers, receivers, and NGOs. Our mission is to reduce food waste and help those in need.',
        },
      ],
    },
    {
      category: 'For Donors',
      questions: [
        {
          q: 'What types of food can I donate?',
          a: 'You can donate any edible food that is safe for consumption - cooked meals, fresh produce, packaged food, baked goods, etc. All food must pass quality inspection before distribution.',
        },
        {
          q: 'How quickly will my donation be picked up?',
          a: 'Once your donation is approved by a Food Quality Checker, it is immediately made available to volunteers. Pickup time depends on volunteer availability in your area, typically within 2-4 hours.',
        },
        {
          q: 'Can I track my donation?',
          a: 'Yes! You can track the status of your donation in real-time through your dashboard - from pending inspection, to approved, assigned to volunteer, picked up, and finally delivered.',
        },
        {
          q: 'What are appreciation badges?',
          a: 'Appreciation badges are rewards given by administrators to recognize frequent and impactful donors. They appear on your profile and in the platform.',
        },
      ],
    },
    {
      category: 'For Volunteers',
      questions: [
        {
          q: 'What are the requirements to become a volunteer?',
          a: 'You must have your own vehicle (car, bike, scooter, etc.) for food pickup and delivery. During registration, you will receive a unique volunteer PIN for identification.',
        },
        {
          q: 'How do I know where to deliver the food?',
          a: 'The platform uses Google Maps integration to provide you with the shortest or quickest route to the donor location. You will also receive destination information for delivery.',
        },
        {
          q: 'Can I choose which donations to accept?',
          a: 'Yes, you can view all available approved donations and choose which ones to accept based on your availability and location.',
        },
        {
          q: 'What if I encounter issues with the food during pickup?',
          a: 'You can report any food quality or safety issues to the Admin through the platform. All food should have already been inspected, but safety is our top priority.',
        },
      ],
    },
    {
      category: 'Food Quality & Safety',
      questions: [
        {
          q: 'How is food quality ensured?',
          a: 'All donations must be brought to a dedicated inspection location where Food Quality Checkers thoroughly inspect the food for safety, hygiene, and quality before approving it for distribution.',
        },
        {
          q: 'What happens to rejected donations?',
          a: 'Rejected donations cannot be distributed through the platform. The donor is notified with remarks from the Food Quality Checker explaining the reason for rejection.',
        },
        {
          q: 'How is food stored if there are multiple donations?',
          a: 'Excess approved food is stored in refrigerators at inspection centers. This food is then prioritized for delivery to orphanages and old-age homes based on prior bookings.',
        },
        {
          q: 'What is the role of a Food Quality Checker?',
          a: 'Food Quality Checkers work at dedicated inspection locations to inspect all food donations. They approve or reject food based on safety and quality standards, and keep detailed inspection logs.',
        },
      ],
    },
    {
      category: 'Distribution Priority',
      questions: [
        {
          q: 'Who receives the food donations first?',
          a: 'The platform intelligently prioritizes footpath dwellers, beggars, and handicapped individuals in high-need areas. Excess food is then distributed to orphanages and old-age homes based on bookings.',
        },
        {
          q: 'How are high-need areas determined?',
          a: 'Administrators manage area data including populations of footpath dwellers and handicapped individuals. The system uses this data to prioritize food distribution to areas with the greatest need.',
        },
      ],
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="text-primary-600" size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about Feed Forward
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqs.map((category, catIndex) => (
              <div key={catIndex} className="card p-6">
                <h2 className="text-2xl font-bold mb-6 text-primary-600">
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === globalIndex;
                    
                    return (
                      <div
                        key={qIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-800 pr-4">
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="text-primary-600 flex-shrink-0" size={24} />
                          ) : (
                            <ChevronDown className="text-gray-400 flex-shrink-0" size={24} />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-4 text-gray-600 animate-fadeInUp">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="card p-8 mt-12 text-center bg-primary-50 border border-primary-200">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-700 mb-6">
              Can't find the answer you're looking for? Please reach out to our support team.
            </p>
            <a
              href="/contact"
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
