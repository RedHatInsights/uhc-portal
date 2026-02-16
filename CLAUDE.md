# OpenShift Cluster Manager UI (uhc-portal)

This repository contains the UI components for the OpenShift Cluster Manager (OCM) site, providing a web-based interface for managing OpenShift clusters.

## Project Overview

**Type**: Web Application UI  
**Framework**: React with TypeScript  
**Architecture**: Frontend SPA with Redux state management  
**Primary Purpose**: OpenShift cluster management interface  
**Target Users**: DevOps engineers, cluster administrators, developers

## Technical Stack

- **Frontend**: React 18+ with TypeScript
- **State Management**: Redux Toolkit (@reduxjs/toolkit)
- **UI Components**: PatternFly React components
- **Build Tool**: Webpack with custom configuration
- **Testing**: Jest with Cypress for E2E testing
- **Package Manager**: Yarn (v1.22.19 specifically required)
- **Code Quality**: ESLint, Prettier, Husky for pre-commit hooks

## Key Architecture Patterns

### Component Structure
- **PatternFly Integration**: Extensive use of Red Hat's PatternFly design system
- **Federated Modules**: Uses @scalprum for micro-frontend architecture
- **Data Fetching**: TanStack Query (React Query) for API state management
- **Form Handling**: Formik for complex form validation and submission

### State Management
- Redux Toolkit for global application state
- TanStack Query for server state caching and synchronization
- React hooks for local component state

### Development Patterns
- **TypeScript**: Strict typing with custom type definitions
- **Internationalization**: i18next for multi-language support
- **Error Tracking**: Sentry integration for production error monitoring
- **Analytics**: Segment integration for user behavior tracking

## Development Workflow

### Local Development
```bash
# Initial setup (required for first-time setup)
make dev-env-setup

# Standard development workflow
yarn install
yarn start
```

### Environment Configuration
- **Development**: https://prod.foo.redhat.com:1337/openshift/
- **Staging Backend**: Default for local development
- **Environment Switching**: URL parameters (`?env=staging|production|mockdata`)

### Testing Strategy
- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Cypress with custom QE automation
- **Mock Data**: Comprehensive mock server for offline development

## AI Development Guidelines

### Code Style and Standards
- Follow PatternFly design patterns for UI consistency
- Use TypeScript strictly - avoid `any` types
- Implement proper error boundaries for React components
- Follow Redux Toolkit patterns for state management
- Use React Query for all API interactions

### Common Development Tasks

#### Adding New Features
1. **UI Components**: Extend PatternFly components with custom styling
2. **API Integration**: Use TanStack Query hooks for data fetching
3. **State Management**: Add Redux slices for complex global state
4. **Routing**: Integrate with existing React Router setup
5. **Testing**: Write comprehensive unit and integration tests

#### Working with APIs
- All API calls should use the existing axios configuration
- Implement proper error handling with user-friendly messages
- Use React Query for caching and background refetching
- Follow OpenShift API conventions and documentation

#### Debugging and Troubleshooting
- Use Redux DevTools for state inspection
- Leverage React Query DevTools for API state debugging
- Check Sentry for production error patterns
- Use browser dev tools with React Developer Tools extension

### Performance Considerations
- **Bundle Optimization**: Webpack configuration includes code splitting
- **Lazy Loading**: Implement dynamic imports for large features
- **Memoization**: Use React.memo and useMemo for expensive computations
- **API Optimization**: Leverage React Query caching strategies

### Security Best Practices
- **Authentication**: Integrate with Red Hat SSO/identity providers
- **Authorization**: Implement proper RBAC based on user roles
- **Data Sanitization**: Validate and sanitize all user inputs
- **HTTPS**: Ensure all API communications use HTTPS

## Useful Commands

```bash
# Development
yarn start                    # Start development server
yarn start --env ai_standalone  # Run with Assisted Installer standalone

# Building
yarn build                    # Production build
yarn build:analyze           # Build with bundle analyzer

# Testing
yarn test                     # Run unit tests
yarn test:watch              # Run tests in watch mode
yarn cypress:open           # Open Cypress E2E tests

# Code Quality
yarn lint                     # ESLint check
yarn lint:fix                # Auto-fix linting issues
yarn prettier               # Format code
```

## Project Structure

```
src/
├── components/           # Reusable UI components
├── pages/               # Route-based page components
├── store/               # Redux store configuration
├── hooks/               # Custom React hooks
├── services/            # API service layers
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── locales/             # Internationalization files
```

## Contributing Guidelines

- **Branch Strategy**: Feature branches from `main`
- **Code Review**: All changes require PR review
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update docs for new features
- **Accessibility**: Follow WCAG 2.1 AA guidelines
- **Performance**: Monitor bundle size and loading times

## Related Repositories

- **Backend APIs**: OpenShift Cluster Manager API services
- **Assisted Installer**: https://github.com/openshift-assisted/assisted-installer-app
- **PatternFly**: https://github.com/patternfly/patternfly-react
- **OCM SDK**: Related OpenShift management tools

This codebase represents a critical user interface for OpenShift cluster management, requiring attention to reliability, security, and user experience.