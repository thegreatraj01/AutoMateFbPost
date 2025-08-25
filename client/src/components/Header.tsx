"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { clearUser } from "@/store/slices/userSlice";
import api from "@/lib/api-client";
import { toast } from "sonner";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];

  const showLogin = pathname === "/sign_up";
  const showLogout = user && pathname !== "/sign_up";

  const handleLogout = async () => {
    const res = await api.post("/auth/logout");
    if (res.status === 200) {
      toast.success("User logedOut successfully");
      localStorage.setItem("isLogedIn", "false");
      dispatch(clearUser());
    }
    router.push("/login");
  };

  return (
    <header className="bg-white shadow">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Automate Things</span>
            <div className="h-8 w-auto bg-gray-100 font-bold text-xl flex items-center justify-center px-3 rounded">
              Automate Things
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex lg:gap-x-4">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className="text-sm font-medium"
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
        </div>

        {/* Right side: Login or Logout */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {showLogin && (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
          {showLogout && (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-2 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}

            <div className="py-4">
              {showLogin && (
                <Button className="w-full" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}
              {showLogout && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
