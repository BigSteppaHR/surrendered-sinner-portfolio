
import React from "react";

// Define subscription plans data with increased prices
export const subscriptionPlans = [
  {
    id: "nutrition",
    name: "Nutrition Plan",
    price: "$150/month",
    priceValue: 150,
    description: "Custom nutrition guidance with macronutrient tracking",
    features: [
      "Personalized macro calculations",
      "Weekly meal planning",
      "Recipe suggestions",
      "Food substitution options",
      "Monthly plan updates"
    ],
    addons: [
      {
        id: "meal-revision",
        name: "Meal Plan Revision",
        price: 35,
        description: "Additional revisions to your meal plan"
      }
    ]
  },
  {
    id: "lifting",
    name: "Lifting Program",
    price: "$175/month",
    priceValue: 175,
    description: "Progressive resistance training for strength and muscle",
    features: [
      "Customized workout schedule",
      "Periodized training approach",
      "Video exercise demonstrations",
      "Progressive overload tracking",
      "Form correction guidance"
    ],
    addons: [
      {
        id: "program-revision",
        name: "Program Revision",
        price: 40,
        description: "Adjust your program as needed"
      }
    ]
  },
  {
    id: "premium",
    name: "Complete Coaching",
    price: "$299/month",
    priceValue: 299,
    description: "Comprehensive fitness and nutrition coaching",
    features: [
      "Everything in Lifting & Nutrition plans",
      "Weekly video check-ins",
      "24/7 messaging support",
      "Progress analysis",
      "Supplement recommendations",
      "Recovery optimization"
    ],
    addons: [
      {
        id: "coaching-advice",
        name: "Priority Coaching Session",
        price: 60,
        description: "30-minute impromptu coaching call"
      }
    ]
  }
];

// Define addons that can be purchased with any plan
export const subscriptionAddons = [
  {
    id: "meal-revision",
    name: "Meal Plan Revision",
    price: 35,
    description: "Get your nutrition plan revised based on your progress and preferences"
  },
  {
    id: "program-revision",
    name: "Lifting Program Revision",
    price: 40,
    description: "Update your lifting program to match your progress and goals"
  },
  {
    id: "coaching-advice",
    name: "Impromptu Coaching Session",
    price: 60,
    description: "30-minute coaching call for immediate guidance and support"
  },
  {
    id: "progress-analysis",
    name: "Progress Pictures Analysis",
    price: 45,
    description: "Detailed feedback and analysis on your progress pictures"
  }
];
