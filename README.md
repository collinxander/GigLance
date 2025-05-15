# GigLance

GigLance is a modern freelance marketplace application connecting creative professionals with clients looking for their services. Built with Next.js, Supabase, and Stripe, it provides a seamless platform for posting gigs, submitting applications, messaging, and secure payments.

## Features

- **User Authentication**: Secure sign up, login, and profile management
- **Gig Management**: Post, search, filter, and apply for gigs
- **Real-time Messaging**: Communicate with clients and freelancers
- **Secure Payments**: Integrated Stripe payment processing
- **Application System**: Submit and track job applications
- **User Profiles**: Showcase skills and portfolio work
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Serverless API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Collinxander/GigLance.git
   cd GigLance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on deploying to Vercel.

## Database Setup

See [SUPABASE_MIGRATION_GUIDE.md](SUPABASE_MIGRATION_GUIDE.md) for detailed instructions on setting up the database.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide Icons](https://lucide.dev/)
- Date handling with [date-fns](https://date-fns.org/)
- Form management with [react-hook-form](https://react-hook-form.com/) and [zod](https://github.com/colinhacks/zod)
