'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', show: true },
    { name: 'Login', href: '/login', show: !user },
    { name: 'Dashboard', href: '/dashboard', show: !!user },
    { name: 'Social', href: '/social', show: !!user },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <nav
        className="container flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
          aria-label="Wallet2FA Home"
        >
          <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
            Wallet2FA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-sm font-medium transition-colors hover:text-primary',
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border md:hidden"
          >
            <div className="container space-y-1 py-4">
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
