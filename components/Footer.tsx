import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
        <div className="mb-8">
          <Image
            src="/logo.svg"
            alt="My Campus Library"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              My Campus Library is an open-source digital resource hub empowering students with
              access to academic materials.
            </p>
          </div>

          {/* Learn Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Learn</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Developer</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/mycampuslib/mcl"
                  target="_blank"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Developer Center
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/mycampuslib/mcl"
                  target="_blank"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex justify-between items-center gap-2 text-sm text-muted-foreground">
          <p>&copy; 2025 My Campus Library. All rights reserved.</p>
          <Link
            href="https://github.com/Spectra010s/mcl"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.115 22 16.379 22 12.017 22 6.484 17.522 2 12 2z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  )
}
