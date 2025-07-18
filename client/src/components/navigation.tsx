import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Utensils, User } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/favorites", label: "My Recipes" },
    { path: "/shopping-lists", label: "Shopping Lists" },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col space-y-4" : "flex items-center space-x-6"}>
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <span
            className={`font-medium transition-colors ${
              location === item.path
                ? "text-primary"
                : "text-gray-700 hover:text-primary"
            }`}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Utensils className="text-primary text-2xl" />
              <span className="text-xl font-bold text-gray-900">CookSmart</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <Button className="bg-primary text-white hover:bg-primary/90">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-6 mt-6">
                <NavLinks mobile />
                <Button className="bg-primary text-white hover:bg-primary/90 w-full">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
