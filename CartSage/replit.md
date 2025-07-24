# AI Shopping Cart Assistant - System Architecture

## Overview

This is a full-stack TypeScript application that serves as an AI-powered shopping assistant. Users can input shopping checklists via text or document upload, and the system uses AI to process these lists, find matching products from various retailers, and manage a shopping cart experience. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and OpenAI for intelligent text processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React-based SPA with Vite bundling
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for text processing and product recommendations
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom AI-themed color variables
- **State Management**: TanStack Query for API state, React context for cart management
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured error handling
- **File Upload**: Multer middleware for document processing
- **Session Management**: Session-based cart management using generated session IDs

### Database Schema
- **Products Table**: Stores product information from various retailers including pricing, ratings, and AI match scores
- **Cart Items Table**: Manages user cart contents with session-based identification
- **Checklist Items Table**: Stores original and AI-processed text from user inputs

### AI Integration
- **Service**: OpenAI GPT-4o model for intelligent text processing
- **Capabilities**: 
  - Checklist item extraction and categorization
  - Product search term generation
  - Recommendation scoring based on user needs
- **Document Processing**: PDF and text document parsing for shopping list extraction

## Data Flow

1. **Input Processing**: Users submit shopping lists via text input or document upload
2. **AI Analysis**: OpenAI processes the input to extract structured shopping items with categories and search terms
3. **Product Matching**: System searches available products and calculates AI match scores
4. **Cart Management**: Users can add products to session-based carts with quantity management
5. **Filtering & Search**: Frontend provides real-time filtering by store, category, price, and ratings

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity (designed for Neon serverless)
- **drizzle-orm**: Type-safe ORM for database operations
- **openai**: Official OpenAI SDK for AI text processing
- **multer**: File upload handling for document processing

### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Development Server**: Vite dev server with HMR for frontend
- **Backend Server**: tsx watch mode for automatic TypeScript compilation
- **Database**: Configured for PostgreSQL with environment-based connection strings
- **Environment Variables**: Supports both local development and Replit deployment

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database Migrations**: Drizzle Kit manages schema migrations
- **Deployment**: Single Node.js process serving both API and static files

### Configuration Management
- **Database Config**: Drizzle configuration with PostgreSQL dialect
- **TypeScript**: Shared tsconfig.json with path mapping for monorepo structure
- **Build Scripts**: Unified build process combining frontend and backend compilation
- **Environment Detection**: Automatic development/production mode switching based on NODE_ENV

The architecture prioritizes developer experience with hot reload, type safety throughout the stack, and clear separation of concerns while maintaining deployment simplicity through a unified build process.