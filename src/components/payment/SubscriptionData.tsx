
import React from "react";

// Define subscription plans data with revised structure
export const subscriptionPlans = [
  {
    id: "beginner",
    name: "Beginner Plan",
    price: "$150/month",
    priceValue: 150,
    description: "For those new to structured training and nutrition planning",
    features: [
      "Personalized training program",
      "Basic nutrition guidance",
      "Form correction advice",
      "Monthly program updates",
      "Email support"
    ],
    addons: [
      {
        id: "program-revision",
        name: "Program Revision",
        price: 40,
        description: "Mid-month program adjustments"
      },
      {
        id: "progress-analysis",
        name: "Progress Analysis",
        price: 45,
        description: "Detailed feedback on your progress"
      }
    ]
  },
  {
    id: "intermediate",
    name: "Intermediate Plan",
    price: "$175/month",
    priceValue: 175,
    description: "For experienced lifters seeking optimized programming",
    features: [
      "Advanced periodized training",
      "Detailed nutrition protocols",
      "Recovery optimization",
      "Bi-weekly check-ins",
      "Priority email support",
      "Supplement recommendations"
    ],
    addons: [
      {
        id: "meal-revision",
        name: "Nutrition Plan Revision",
        price: 35,
        description: "Mid-month nutrition adjustments"
      },
      {
        id: "program-revision",
        name: "Program Revision",
        price: 40,
        description: "Mid-month program adjustments"
      }
    ]
  },
  {
    id: "advanced",
    name: "Advanced Enhancement Plan",
    price: "$299/month",
    priceValue: 299,
    description: "For athletes using performance enhancement requiring specialized protocols",
    features: [
      "PED-optimized training protocols",
      "Cycle-specific nutrition planning",
      "Health marker monitoring guidance",
      "Weekly check-ins and adjustments",
      "24/7 messaging support",
      "Advanced supplement protocols",
      "Recovery and ancillary recommendations"
    ],
    addons: [
      {
        id: "coaching-advice",
        name: "Emergency Coaching Call",
        price: 60,
        description: "30-minute impromptu coaching session"
      }
    ]
  },
  {
    id: "competition",
    name: "Competition Prep Plan",
    price: "$399/month",
    priceValue: 399,
    description: "Comprehensive preparation for bodybuilding competitions",
    features: [
      "Contest-specific training periodization",
      "Peak week protocols",
      "Stage presentation guidance",
      "Twice-weekly check-ins with adjustments",
      "Detailed posing feedback",
      "Custom carb cycling and water manipulation",
      "24/7 priority coaching access",
      "Post-show recovery planning"
    ],
    addons: [
      {
        id: "posing-session",
        name: "Extra Posing Session",
        price: 75,
        description: "Additional 45-minute posing practice and feedback"
      },
      {
        id: "coaching-advice",
        name: "Emergency Coaching Call",
        price: 60,
        description: "30-minute impromptu coaching session"
      }
    ]
  }
];

// Define addons that can be purchased with any plan
export const subscriptionAddons = [
  {
    id: "meal-revision",
    name: "Nutrition Plan Revision",
    price: 35,
    description: "Get your nutrition plan revised based on your progress and preferences",
    recommended: false
  },
  {
    id: "program-revision",
    name: "Training Program Revision",
    price: 40,
    description: "Update your training program to match your progress and goals",
    recommended: false
  },
  {
    id: "coaching-advice",
    name: "Impromptu Coaching Session",
    price: 60,
    description: "30-minute coaching call for immediate guidance and support",
    recommended: false
  },
  {
    id: "progress-analysis",
    name: "Progress Pictures Analysis",
    price: 45,
    description: "Detailed feedback and analysis on your progress pictures",
    recommended: false
  },
  {
    id: "posing-session",
    name: "Posing Practice Session",
    price: 75,
    description: "45-minute posing practice and feedback for competitors",
    recommended: false
  }
];
