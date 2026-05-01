HEAD
# prodesk-capstone-vitalsync
A professional healthcare dashboard for patient management and appointment scheduling.

# VitalSync | Enterprise Healthcare Patient Dashboard

## 1. Project Overview
VitalSync is a specialized hospital management interface. The goal is to provide a seamless experience for patients to track their medical journey and for doctors to manage their daily schedules.

## 2. Track & Tech Stack
- **Track:** Frontend Intern
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (Global Store)
- **Component Library:** Lucide React (Icons) & Radix UI / Shadcn

## 3. Core Features
### Phase 1: Patient Experience
- **Personalized Dashboard:** A high-level view of upcoming appointments and health vitals.
- **Medical History Timeline:** A vertical scroll showing past visits, diagnoses, and test results.
- **Prescription Viewer:** A clean list of current medications with dosage instructions.

### Phase 2: Scheduling & Management
- **Doctor Availability:** Real-time lookup for available time slots.
- **Appointment Booking:** A multi-step form to book consultations.
- **Role-Based Access:** Different views for "Doctor" vs. "Patient" users.

## 4. Proposed State Structure (Zustand)
We will manage the following global slices:
- `authDetails`: Handles user login state and roles.
- `appointmentDetails`: Manages the list of booked and pending visits.
- `patientDetails`: Stores the medical records currently being viewed.

## 5. UI/UX Plan
- **Primary Color:** Medical Blue (#0052FF)
- **Secondary Color:** Slate Gray (#64748B) for text clarity.
- **Typography:** Inter or Geist Sans for a modern look.

- ## UI Design (Figma)
The interface was designed with a focus on visual hierarchy and accessibility.
- **View Figma File:** [VitalSync Design System & Wireframes](https://www.figma.com/design/gWobHDbldSlXtbHVMulHEQ/Untitled?node-id=0-1&t=b2m6isIpwI51pLqM-1)

- ## State Tree & API Flow
The application utilizes a centralized Zustand store to manage global data flow, ensuring a "Single Source of Truth."
[(https://github.com/riyamangal2732005/prodesk-capstone-vitalsync/blob/main/architectureVitalSync.png)]

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
7c4a32d (Phase1:  setup auth flow, layouts, and logout functionality)
