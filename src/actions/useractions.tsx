"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    // existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) return null;

    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        clerkId: true,
        username: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.log("Error in getCurrentUser", error);
    return null;
  }
}

export async function updateUsername(newUsername: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "Not authenticated" };
    }

    // Get the current user from database
    const currentUserDb = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!currentUserDb) {
      return { success: false, message: "User not found" };
    }

    // If username hasn't changed, return success without doing anything
    if (currentUserDb.username === newUsername) {
      return { success: true };
    }

    // Check if username already exists for another user
    const existingUser = await prisma.user.findUnique({
      where: {
        username: newUsername,
      },
    });

    if (existingUser) {
      return { success: false, message: "Username already taken" };
    }

    // Update the username in the User table
    await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        username: newUsername,
      },
    });

    // Also update the username in all StudyGroupMember records for this user
    await prisma.studyGroupMember.updateMany({
      where: {
        userId: currentUserDb.id,
      },
      data: {
        username: newUsername,
      },
    });

    return { success: true };
  } catch (error) {
    console.log("Error in updateUsername", error);
    return { success: false, message: "Failed to update username" };
  }
}

export async function deleteCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "Not authenticated" };
    }

    // Find the user to get their database ID
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // First, delete all study groups authored by the user
    await prisma.studyGroup.deleteMany({
      where: {
        authorId: user.id,
      },
    });

    // Delete the user from the database
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.log("Error in deleteCurrentUser", error);
    return { success: false, message: "Failed to delete account" };
  }
}

// Function to search for study groups by subject
export async function searchSubjects(searches: string) {
  try {
    if (!searches) return [];

    const results = await prisma.studyGroup.findMany({
      where: {
        subject: {
          // We are searching within the subject field for matching searches.
          contains: searches,
          mode: "insensitive", // Case-insensitive search.
        },
      },
      take: 10, // Limit the results to 10 study groups.
      include: {
        owner: { select: { username: true, image: true } }, // Optional: Include the owner of the study group.
      },
    });

    return results;
  } catch (error) {
    console.log("Error in searchSubjects", error);
    return [];
  }
}
