import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

const sampleCategories = [
  {
    name: "General Medicine",
    slug: "general-medicine",
    description: "General health questions and medical advice",
    icon: "Heart",
    color: "blue",
  },
  {
    name: "Cardiology",
    slug: "cardiology",
    description: "Heart and cardiovascular health",
    icon: "Heart",
    color: "red",
  },
  {
    name: "Dermatology",
    slug: "dermatology",
    description: "Skin conditions and cosmetic procedures",
    icon: "Sparkles",
    color: "pink",
  },
  {
    name: "Orthopedics",
    slug: "orthopedics",
    description: "Bone, joint, and muscle treatments",
    icon: "Activity",
    color: "orange",
  },
  {
    name: "Dental Care",
    slug: "dental-care",
    description: "Dental treatments and oral health",
    icon: "Smile",
    color: "green",
  },
  {
    name: "Plastic Surgery",
    slug: "plastic-surgery",
    description: "Cosmetic and reconstructive surgery",
    icon: "Scissors",
    color: "purple",
  },
  {
    name: "Ophthalmology",
    slug: "ophthalmology",
    description: "Eye care and vision correction",
    icon: "Eye",
    color: "gray",
  },
  {
    name: "Cancer Treatment",
    slug: "cancer-treatment",
    description: "Oncology and cancer care options",
    icon: "Shield",
    color: "red",
  },
];

export async function POST() {
  try {
    // Check if categories already exist
    const existingCategories = await adminClient.fetch(`
      count(*[_type == "category"])
    `);

    if (existingCategories > 0) {
      return NextResponse.json({
        success: false,
        message: "Categories already exist",
        count: existingCategories,
      });
    }

    // Create sample categories
    const createdCategories = [];

    for (const categoryData of sampleCategories) {
      const category = await adminClient.create({
        _type: "category",
        name: categoryData.name,
        slug: {
          _type: "slug",
          current: categoryData.slug,
        },
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color,
        createdAt: new Date().toISOString(),
      });

      createdCategories.push(category);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdCategories.length} sample categories`,
      categories: createdCategories,
    });
  } catch (error) {
    console.error("Error seeding categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed categories",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categoriesCount = await adminClient.fetch(`
      count(*[_type == "category"])
    `);

    return NextResponse.json({
      success: true,
      count: categoriesCount,
      message: categoriesCount > 0
        ? `${categoriesCount} categories exist`
        : "No categories found - use POST to seed sample data",
    });
  } catch (error) {
    console.error("Error checking categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check categories",
      },
      { status: 500 }
    );
  }
}
