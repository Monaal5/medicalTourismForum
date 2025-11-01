import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await adminClient.fetch(
      `*[_type == "category" && _id == $categoryId][0]`,
      { categoryId }
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete the category
    await adminClient.delete(categoryId);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const body = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const { name, description, icon, color } = body;

    // Build update object
    const updates: any = {};
    if (name) {
      updates.name = name;
      // Update slug if name changes
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updates.slug = {
        _type: "slug",
        current: slug,
      };
    }
    if (description !== undefined) updates.description = description;
    if (icon) updates.icon = icon;
    if (color) updates.color = color;

    // Update the category
    const updatedCategory = await adminClient
      .patch(categoryId)
      .set(updates)
      .commit();

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}
