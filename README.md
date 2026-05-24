# Neo Tokyo — Service / RMA Tracker v2.0

A premium, modern RMA (Return Merchandise Authorization) tracking app for Neo Tokyo's service department.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (soft futuristic glassmorphism)
- **State**: Zustand
- **Backend**: Supabase (PostgreSQL + Storage)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Export**: SheetJS (xlsx)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to your Supabase project dashboard
2. Open **SQL Editor**
3. Paste and run the contents of `supabase-setup.sql`
4. Go to **Storage** → Create a new bucket called `ticket-photos` (set it to Public)

### 3. Configure Environment

Create a `.env` file (already included):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — stats + recent activity |
| `/rma` | RMA ticket list with search & filter |
| `/rma/new` | Create new RMA ticket |
| `/rma/:id` | View/edit ticket + photos |
| `/rack` | Rack inventory management |
| `/service` | Service section (coming soon) |
| `/warranty` | Warranty section (coming soon) |
| `/settings` | Manage lists, export, backup |

## Design System

- Soft futuristic Japanese tech aesthetic
- Light pastel glassmorphism with pink accents
- Inter font (body) + JetBrains Mono (tags/codes)
- Large rounded corners (28px cards)
- Generous whitespace and spacing
- Subtle pink shadows and glow effects

## License

Private — Neo Tokyo, Kochi
