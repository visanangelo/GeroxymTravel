"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground tracking-tight">
              Voyager Tours
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#circuite"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Circuite
            </Link>
            <Link
              href="#despre"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Despre Noi
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Button size="sm">Rezervă Acum</Button>
          </nav>

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                href="#circuite"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Circuite
              </Link>
              <Link
                href="#despre"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Despre Noi
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Button size="sm" className="w-fit">
                Rezervă Acum
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
