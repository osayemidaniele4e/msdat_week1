# MSDAT System Architecture

## 1. Overview
MSDAT (Multi-Source Data Analytics and Triangulation) is a Vue.js-based Single Page Application (SPA) designed for health data analytics. It interacts with external APIs for data retrieval and provides a rich, interactive dashboard for visualizing health indicators across different administrative levels (National, State, LGA).

## 2. High-Level Architecture
The system follows a standard **Client-Server** architecture, where the repository represents the **Client** (Frontend) with a localized **BFF (Backend for Frontend)** pattern for static serving and SEO optimization.

### Components
1.  **Frontend Client (Vue.js SPA)**:
    -   Core framework: Vue.js 2.7
    -   UI Library: Bootstrap Vue, Element UI
    -   State Management: Vuex (with persistence)
    -   Routing: Vue Router
    -   Charts/Maps: Highcharts
2.  **App Server (Node.js/Express)**:
    -   Serves static assets (`dist`).
    -   Handles SPA routing fallback (`index.html`).
    -   **SEO/Crawler Middleware**: Intercepts social media bots and serves pre-rendered HTML for Open Graph tags.
3.  **External API (Backend)**:
    -   RESTful API (e.g., `https://msdat2api.e4eweb.space/api/`).
    -   Handles authentication, data CRUD, and business logic.
4.  **Data Layer**:
    -   Centralized module (`src/modules/data-layer`) for API interaction and global state management of core entities (Locations, Indicators, Factors).

## 3. Project Structure
The project utilizes a **Modular Architecture**. Features are encapsulated within `src/modules`.

```
/
├── server/                 # Express App Server
│   ├── index.js            # Server entry point
│   ├── middleware/         # Custom middleware (Crawler/SEO)
│   └── templates/          # HTML templates
├── src/
│   ├── modules/            # Domain Modules
│   │   ├── auth/           # Authentication Module
│   │   ├── data-layer/     # Core Data Management (API Services, Store)
│   │   ├── msdat-dashboard/ # Main Dashboard Module (Views, Components)
│   │   └── ...
│   ├── config/             # App Configuration (Axios, etc.)
│   ├── services/           # specialized services (AI/Analysis)
│   ├── store/              # Root Vuex Store
│   └── main.ts             # Application Entry Point
├── package.json            # Dependencies & Scripts
└── docker-compose.yml      # Infrastructure Definitions
```

## 4. Key Modules & Sub-systems

### 4.1. Data Layer (`src/modules/data-layer`)
This is the backbone of the application's data flow.
-   **Purpose**: Manages global data entities like Locations, Indicators, Data Sources, and Factors.
-   **Mechanism**: Uses Vuex to cache this data and exposes `ApiServices` for raw API interaction.
-   **Dependency**: Other modules (like `msdat-dashboard`) rely on `data-layer` for data consistency.

### 4.2. MSDAT Dashboard (`src/modules/msdat-dashboard`)
The main user-facing module.
-   **Structure**: Recursive modularity (contains its own `store`, `views`, `components`).
-   **Functionality**: Displays charts, maps, and tables based on selected indicators.

### 4.3. App Server (`server/`)
A lightweight Express application.
-   **Crawler Middleware**: Detects User-Agents (Facebook, Twitter, LinkedIn bots) and injects meta tags dynamically before serving the page.
-   **Static Serving**: Efficiently serves built assets with caching policies.

## 5. Data Flow
1.  **Initialization**: App loads, `data-layer` action is dispatched to fetch Metadata (Locations, Indicators).
2.  **User Interaction**: User selects parameters (Location, Year, Indicator) in `msdat-dashboard`.
3.  **Request**: Component dispatches action -> Calls `ApiServices` (or `SmartAnalysisDataService` for AI features).
4.  **API Call**: Axios sends HTTP GET to External API (`VUE_APP_API_BASE_URL`).
5.  **State Update**: Data is committed to Vuex Store.
6.  **Rendering**: Components reactively update to show visualized data (Highcharts/Leaflet).

## 6. Infrastructure
-   **Docker**: Containerized using `Dockerfile` and `docker-compose.yml`.
-   **CI/CD**: `.gitlab-ci.yml` for automated testing and deployment.
-   **Testing**:
    -   Unit: Jest (`npm run test:unit`)
    -   E2E: Cypress (`npm run test:e2e`)

## 7. Technology Stack
-   **Language**: JavaScript / TypeScript (Hybrid)
-   **Framework**: Vue.js 2
-   **State**: Vuex + Vuex Persist
-   **Network**: Axios
-   **Styles**: SCSS, Bootstrap 4
-   **Backend Runtime**: Node.js (Express)
