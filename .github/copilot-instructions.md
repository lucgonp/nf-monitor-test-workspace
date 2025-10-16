# NF Monitor Test Workspace

This workspace contains a comprehensive testing setup for an Electron-based NF (Nota Fiscal) monitoring application.

## Project Overview

- **Type**: Testing workspace for Electron application
- **Primary Language**: TypeScript/JavaScript
- **Testing Frameworks**: Playwright (E2E), Cypress (UI), Vitest (Unit)
- **Target Application**: NF Monitor (Electron app for monitoring fiscal notes)

## Key Features

- End-to-end testing with Playwright for Electron apps
- UI testing with Cypress for web components
- Integration testing with API mocking using Nock
- Test harness for IPC communication testing
- Comprehensive test structure with stable selectors

## Development Guidelines

- Use `data-testid` attributes for stable test selectors
- Follow the established test structure patterns
- Mock external APIs in integration tests
- Test IPC communication between renderer and main processes
- Maintain separation between E2E, integration, and unit tests

## Test Structure

- `/tests/e2e/` - Playwright end-to-end tests
- `/cypress/` - Cypress UI tests with support files
- `/tests-integration/` - Integration tests with API mocking
- `/test-harness/` - Test utilities and IPC hooks

## Environment Setup

- Use `ELECTRON_TEST=1` environment variable for test mode
- Configure test directories and temporary files appropriately
- Enable test-specific IPC handlers when in test mode