import Link from 'next/link';
import { Target, Code, Mail, MessageCircle, Users } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Lakshya
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Your AI-powered companion for achieving ambitious goals. From GATE to placements, we've got you covered.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors group"
              >
                <Code className="h-4 w-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors group"
              >
                <MessageCircle className="h-4 w-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors group"
              >
                <Users className="h-4 w-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
              </a>
              <a 
                href="mailto:hello@lakshya.app" 
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors group"
              >
                <Mail className="h-4 w-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Guides
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Lakshya. All rights reserved. Built with ❤️ for Indian students.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
