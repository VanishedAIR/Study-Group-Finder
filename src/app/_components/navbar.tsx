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
