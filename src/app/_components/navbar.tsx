/**
 * Navbar Component
 *
 * This component renders the navigation bar for the Study Group Finder application.
 * It includes a logo, a mode toggle button, and a client-side navigation bar.
 *
 * Features:
 * - Displays the application logo that links to the home page.
 * - Includes a mode toggle button for switching between light and dark themes.
 * - Renders the `ClientNavbar` component for user-specific navigation options.
 * - Syncs the current user with the database if the user is signed in.
 *
 * Components:
 * - `ClientNavbar`: Handles user-specific navigation options (e.g., sign-in or profile).
 * - `ModeToggle`: A button for toggling between light and dark themes.
 * - `Link`: Provides navigation to the home page.
 *
 * External Actions:
 * - `currentUser`: Retrieves the currently signed-in user from Clerk.
 * - `syncUser`: Syncs the current user with the database.
 *
 * Styling:
 * - Uses Tailwind CSS for layout and styling.
 * - Includes responsive design for the header and navigation elements.
 *
 * Behavior:
 * - Displays the navigation bar with user-specific options and theme toggle functionality.
 */


import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/useractions";
import ClientNavbar from "./ClientNavbar";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/toggle";

export default async function Navbar() {
  const user = await currentUser();
  if (user) await syncUser(); // POST

  return (
    <section>
      <header className="flex justify-between items-center p-4 h-25">
        <Link href="/">
          <img src="/logo.svg" alt="Logo" className="h-20 w-20 mt-1.35" />
        </Link>
        <div className = "flex gap-8">
          <ModeToggle />
          <ClientNavbar />
        </div>
      </header>
    </section>
  );
}
