# Fusion Starter

The Fusion Starter is a modern, production-ready template for building full-stack React applications using react-router-dom in SPA mode.

## Core Framework & Technologies

- **React 18**
- **React Router 6**: Powers the client-side routing
- **TypeScript**: Type safety is built-in by default
- **Vite**: Bundling and development server
- **Vitest**: For testing
- **TailwindCSS 3**: For styling

## Routing System

The routing system is powered by React Router 7:

- `src/pages/Index.tsx` represents the home page.
- Routes are defined in `src/App.tsx` using the `react-router-dom` import
- Route files are located in the `src/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

## Styling System

The styling system combines several technologies:

- **TailwindCSS 3**: Used as the primary styling method with utility classes
- **tailwind.config.ts**: Used to describe the design system tokens, update this file to change the whole look and feel
- **CSS Imports**: Base styles are imported in `src/index.css`
- **UI Component Library**: A comprehensive set of pre-styled UI components in `src/components/ui/` built with:
  - Radix UI: For accessible UI primitives
  - Class Variance Authority: For component variants
  - TailwindCSS: For styling
  - Lucide React: For icons
  - Lots of utility components, like carousels, calendar, alerts...
- **Class Name Utility**: The codebase includes a `cn` utility function from `@/lib/utils` that combines the functionality of `clsx` and `tailwind-merge`. Here's how it's typically used:

  ```typescript
  // A complex example showing the power of the cn utility
  function CustomComponent(props) {
    return (
      <div
        className={cn(
          // Base styles always applied
          "flex items-center rounded-md transition-all duration-200",

          // Object syntax for conditional classes - keys are class names, values are boolean expressions
          {
            // Size-based classes
            "text-xs p-1.5 gap-1": props.size === "sm",
            "text-base p-3.5 gap-3": props.size === "lg",

            // Width control
            "w-full": isFullWidth,
            "w-auto": !isFullWidth,
          },

          // Error state overrides other states
          props.hasError && "border-red-500 text-red-700 bg-red-50",

          // User-provided className comes last for highest precedence
          props.className
        )}
      />
    );
  }
  ```

The styling system supports dark mode through CSS variables and media queries.

## Testing

- **Unit Testing Utilities**: Utility functions such as `cn` in `src/lib/utils.ts` are covered by dedicated unit tests in `src/lib/utils.spec.ts`.
- **Testing Framework**: Tests are written using [Vitest](https://vitest.dev/), which provides a Jest-like API and fast performance for Vite projects.
- **Adding More Tests**: Place new utility tests in the same directory as the utility, using the `.spec.ts` suffix.

## Development Workflow

- **Development**: `npm run dev` - Starts the development server with HMR
- **Production Build**: `npm run build` - Creates optimized production build
- **Type Checking**: `npm run typecheck` - Validates TypeScript types
- **Run tests**: `npm test` - Run all .spec tests

## Error Handling & Stability

The application implements robust error handling and fallback mechanisms:

### API Fallback System

- **Development Mode**: Automatically falls back to mock data when backend is unavailable
- **Network Errors**: Gracefully handled with informative console warnings
- **Null Safety**: All components use fallback data with proper null checks

### Recent Stability Improvements

- ✅ **Fixed null reference errors** in SuperAdminDashboard component
- ✅ **Enhanced fallback data handling** for all API responses
- ✅ **Consistent data structure usage** throughout the application
- ✅ **TypeScript safety** maintained with proper type checking

### Fallback Data Pattern

```typescript
// Example of robust fallback handling
const {
  data: schools,
  loading: schoolsLoading,
  error: schoolsError,
} = useSchools();

// Always use processed fallback data, never raw API data
const schoolsData = schools || [];
const systemStatsData = systemStats || {
  totalSchools: 0,
  totalStudents: 0,
  totalTeachers: 0,
  avgPerformance: 0,
  systemUptime: 0,
  dataStorage: 0,
  activeUsers: 0,
  dailyLogins: 0,
};
```

### Development Experience

- **API Errors**: Expected behavior when no backend is running
- **Mock Data**: Comprehensive fallback data for all endpoints
- **Console Warnings**: Clear feedback about fallback mode activation
- **Zero Crashes**: Application remains stable regardless of backend availability

## Architecture Overview

The architecture follows a modern React application structure with enhanced error handling:

```
package.json
src/
├── components/     # Reusable UI components
│   └── ui/         # Core UI component library
├── pages/          # Route components and logic
├── services/       # API layer with fallback support
│   ├── api.ts                 # Core API client
│   ├── apiWithFallback.ts     # Enhanced API with mock fallback
│   ├── mockData.ts            # Comprehensive mock data
│   └── auth.ts                # Authentication service
├── hooks/          # Custom React hooks
│   └── useApi.ts              # API hooks with error handling
├── lib/            # Utility functions
├── App.css         # Global styles
├── App.tsx         # Main application with routing
└── main.tsx        # Application entry point
```

This structure provides a clean separation of concerns between UI components, API services, and application logic, with robust error handling at every layer.
