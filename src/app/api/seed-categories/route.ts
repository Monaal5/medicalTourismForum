
import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

// Define the categories to seed
const CATEGORIES = [
  {
    name: "Cardiology",
    description: "Heart and cardiovascular health",
    icon: "Heart",
    color: "#ef4444", // red-500
    slug: "cardiology"
  },
  {
    name: "Companion / Attendant Support",
    description: "Support tips for travel companions and attendants.",
    icon: "Users",
    color: "#f59e0b", // amber-500
    slug: "companion-attendant-support"
  },
  {
    name: "Dental Care",
    description: "Dental treatments and oral health",
    icon: "Smile",
    color: "#22c55e", // green-500
    slug: "dental-care"
  },
  {
    name: "Dermatology",
    description: "Skin conditions and cosmetic procedures",
    icon: "Sun",
    color: "#f472b6", // pink-400
    slug: "dermatology"
  },
  {
    name: "Doctor Reviews",
    description: "Honest feedback and experiences with doctors.",
    icon: "Star",
    color: "#3b82f6", // blue-500
    slug: "doctor-reviews"
  },
  {
    name: "General Medicine",
    description: "General health questions and medical advice",
    icon: "Activity",
    color: "#3b82f6", // blue-500
    slug: "general-medicine"
  },
  {
    name: "Hospital Reviews",
    description: "Real patient reviews and ratings of hospitals.",
    icon: "Building",
    color: "#1d4ed8", // blue-700
    slug: "hospital-reviews"
  },
  {
    name: "Insurance & Payment Guidance",
    description: "Insurance coverage, claim support, and payment advice.",
    icon: "CreditCard",
    color: "#2563eb", // blue-600
    slug: "insurance-payment-guidance"
  },
  {
    name: "International Patient Stories & Experiences",
    description: "Real experiences shared by global medical travelers.",
    icon: "Globe",
    color: "#16a34a", // green-600
    slug: "international-patient-stories"
  },
  {
    name: "Medical Visa & Immigration Help",
    description: "Visa guidance, invitation letters, and immigration support.",
    icon: "FileText",
    color: "#9333ea", // purple-600
    slug: "medical-visa-immigration-help"
  },
  {
    name: "Oncology",
    description: "Cancer treatments, therapies, costs for international patients.",
    icon: "Activity",
    color: "#f9a8d4", // pink-300
    slug: "oncology"
  },
  {
    name: "Ophthalmology",
    description: "Eye care and vision correction",
    icon: "Eye",
    color: "#6b7280", // gray-500
    slug: "ophthalmology"
  },
  {
    name: "Orthopedics",
    description: "Bone, joint, and orthopedic treatments",
    icon: "Activity",
    color: "#2563eb", // blue-600
    slug: "orthopedics"
  },
  {
    name: "Other Treatments",
    description: "General medical treatments not listed in main categories.",
    icon: "MoreHorizontal",
    color: "#6b7280", // gray-500
    slug: "other-treatments"
  },
  {
    name: "Plastic Surgery",
    description: "Cosmetic and reconstructive surgery",
    icon: "Scissors", // or similar
    color: "#db2777", // pink-600
    slug: "plastic-surgery"
  },
  {
    name: "Spinal Surgery",
    description: "Back pain, spinal disorders, and spine surgery.",
    icon: "Activity",
    color: "#dc2626", // red-600
    slug: "spinal-surgery"
  },
  {
    name: "Treatment Cost & Budget Planning",
    description: "Cost estimations and budget planning for treatments.",
    icon: "DollarSign",
    color: "#2563eb", // blue-600
    slug: "treatment-cost-budget-planning"
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Simple protection: Check if user is admin or using a secret?
    // For now, let's assume this is run manually or by admin via Postman/dashboard.
    // Ideally check body.secret === process.env.ADMIN_SECRET or similar.

    console.log("Seeding categories...");

    const results = [];

    for (const cat of CATEGORIES) {
      // Upsert based on slug
      const { data, error } = await supabase
        .from('categories')
        .upsert({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          color: cat.color
        }, { onConflict: 'slug' }) // Use slug as unique key
        .select()
        .single();

      if (error) {
        console.error(`Error upserting category ${cat.name}:`, error);
        results.push({ name: cat.name, status: 'error', error: error.message });
      } else {
        results.push({ name: cat.name, status: 'success', id: data.id });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error("Error seeding categories:", error);
    return NextResponse.json(
      { error: "Failed to seed categories", details: error.message },
      { status: 500 },
    );
  }
}
