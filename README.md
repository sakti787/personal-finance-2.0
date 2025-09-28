# UangSakti - Personal Finance Tracker

A modern, comprehensive personal finance tracking web application built for young Indonesians. It provides an intuitive, secure, and visually appealing platform to manage finances effectively.

## Features

- **Authentication System**
  - User registration with username, email, and password
  - Secure sign in/out functionality
  - Protected routes for authenticated users

- **Transaction Management**
  - CRUD operations for income and expense transactions
  - Ability to categorize transactions
  - Date tracking for all transactions
  - Currency input for Indonesian Rupiah formatting

- **Category Management**
  - CRUD operations for custom categories
  - Ability to tag transactions with categories

- **Budgeting**
  - Set monthly budgets for specific categories
  - Visual progress bars showing budget usage
  - Track spending against budget limits

- **Financial Goals**
  - Create savings goals with target amounts
  - Track progress toward goals
  - Add funds toward existing goals

- **Reports & Analysis**
  - Pie charts for expense breakdown by category
  - Bar charts comparing income vs expenses over time
  - Monthly summary tables with savings rates

- **UI/UX Features**
  - Exclusive dark mode theme
  - Responsive design for all devices
  - Smooth animations and transitions
  - Intuitive navigation and workflow

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **UI Library**: Shadcn UI
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Backend & Database**: Supabase (Auth, PostgreSQL, Storage)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Number Formatting**: react-number-format

## Color Palette

- **Background (Oxford Blue)**: #14213d
- **Card/Container (Black)**: #000000
- **Primary/Accent (Orange Web)**: #fca311
- **Foreground (Platinum)**: #e5e5e5
- **Subtle Text (White Shade)**: #ffffff

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd personal-finance-2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a Supabase account at [supabase.io](https://supabase.io)
   - Create a new project
   - Copy your `Project URL` and `anon key`

4. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Set up the database:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Execute the contents of `database_setup.sql` file to create tables and RLS policies

6. Configure environment variables with your actual Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   To get these values:
   - Go to your Supabase dashboard
   - Navigate to Project Settings
   - Find "API" section
   - Copy the "URL" for SUPABASE_URL
   - Copy the "anon public" key for SUPABASE_ANON_KEY

7. Run the development server:
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Sign up for a new account
2. Add your first category (e.g., "Food", "Transport", "Salary")
3. Start tracking transactions with descriptions, amounts, and categories
4. Set monthly budgets for different categories to control spending
5. Create financial goals to save for specific targets
6. Check the dashboard and reports for insights into your financial habits

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   │   ├── transactions/  # Transaction management
│   │   ├── categories/    # Category management
│   │   ├── budgets/       # Budgeting features
│   │   ├── goals/         # Financial goals
│   │   └── reports/       # Reports and analytics
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   └── auth/             # Authentication components
├── lib/                  # Utilities, stores, and types
│   ├── store/            # Zustand stores (auth, data)
│   ├── supabase/         # Supabase client setup
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
└── ...
```

## Key Components

- `CurrencyInput`: Custom input component for Indonesian Rupiah formatting
- `ProgressBar`: Visual indicator for budget/progress tracking
- `AnimatedCard`: Animated card components with Framer Motion
- `useDataStore`: Zustand store for managing application data
- `useAuthStore`: Zustand store for authentication state

## API Integration

The application uses Supabase for:
- Authentication (email/password)
- Database operations (PostgreSQL)
- Real-time features (optional)
- Row Level Security (RLS) for data isolation

## Security

- Row Level Security (RLS) policies ensure users only access their own data
- Secure authentication with JWT tokens handled automatically by Supabase
- Environment variables for sensitive configuration
- Input validation on both frontend and backend

## Customization

To modify the theme, update `tailwind.config.ts` and `src/app/globals.css`.
To add new features, create new pages in the `app/` directory following the existing patterns.

## Troubleshooting

- If you get authentication errors, ensure your Supabase credentials are correct
- If charts don't display, verify that you have transactions with amounts
- If styling appears incorrect, clear your browser cache and restart the development server

## License

This project is private and for educational purposes only.