# My Campus Library

An open-source digital library and study desk for students and faculty, providing access to academic materials and focused on empowering knowledge for every student

## Overview

A high-performance academic resource management system built with Next.js, TypeScript, and Supabase. The platform provides a centralized hub for students to access, download, and contribute study materials while implementing a robust administrative workflow for content moderation.

## Features

- **Hierarchical Browse**: Navigate resources organized by Faculty → Department → Academic Level → Course
- **Full-Text Search**: Search across keywords, course codes, and filenames
- **Anonymous Access**: Browse all resources without authentication
- **User Accounts**: Create account to download resources, create bookmarks
- **Contributions**: Faculty and students can upload resources
- **Community Ratings**: Download, bookmarks and views counts on resources to help other students
- **Admin Dashboard**: Moderate and manage resources at `/admin` (admin role required)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Spectra010s/mcl.git
   cd mcl
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Fill in your Supabase credentials in `.env.local`

5. Run database migrations:

- Open your Supabase dashboard
- Go to SQL Editor
- Copy and run the script from `scripts/schema.sql`

6. Start development server:
   ```bash
   npm run dev
   ```

Visit http://localhost:3000 to see the application.

### Setting Up Your First Admin

1. Sign up through the app at `/signup`
2. Go to your Supabase Dashboard > Table Editor > users
3. Find your user record and change `role` from `user` to `admin`
4. Log out and log back in
5. Access admin features at `/admin`

## Project Structure

```
mcl/
├── app/ # Next.js app directory
│ ├── admin/ # Admin dashboard (role-protected)
│ ├── auth/ # Authentication pages
│ ├── browse/ # Browse by faculty → course
│ ├── search/ # Search interface
│ ├── resource/ # Resource details
│ ├── help/ # Help and FAQ page
│ ├── about/ # About us page
│ ├── api/ # API routes files
│ ├── upload/ # Upload form
│ ├── settings/ # User settings
│ └── page.tsx # Homepage
├── assets/ MCL brand assets
├── components/ # React and Page components
├── lib/ # Utilities and configurations
├── docs/ # Full documentation
├── scripts/ # Database migrations
└── README.md
```

For detailed documentation, see the `/docs` folder.

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Community & Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/Spectra010s/mcl/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/Spectra010s/mcl/discussions)
- **Email**: spectra010s@gmail.com

See [SUPPORT.md](SUPPORT.md) for detailed support information.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Code of Conduct

Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating in this community.

## Roadmap

- [x] Admin resource moderation dashboard
- [ ] In-browser file preview (PDF/Image viewer)
- [ ] Advanced analytics dashboard (Resource popularity, activity tracking)
- [ ] Advanced search filters (by level, department)
- [ ] Resource recommendations
- [ ] API documentation
- [ ] Mobile app
- [ ] Multi-language support

## Acknowledgments

Built with love for the academic community by students, for students.
