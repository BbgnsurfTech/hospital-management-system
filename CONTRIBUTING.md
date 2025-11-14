# Contributing to Hospital Management System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Use case description
   - Expected behavior
   - Any mockups or examples
   - Potential implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write/update tests
5. Ensure all tests pass: `npm test`
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for detailed setup instructions.

## Coding Standards

### TypeScript Style Guide

- Use TypeScript strict mode
- Define types for all function parameters and returns
- Use interfaces for object shapes
- Avoid `any` type
- Use async/await over callbacks

### Naming Conventions

```typescript
// Files: camelCase
authController.ts
notificationService.ts

// Classes: PascalCase
class PatientManager {}

// Functions/Variables: camelCase
const getUserById = () => {}
const patientName = "John"

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3

// Interfaces: PascalCase
interface User {}
```

### Code Formatting

- Use Prettier for formatting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas
- Semicolons required

### Git Commit Messages

Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(patient): add patient search functionality

Add search endpoint to filter patients by name, registration number, and phone number.
Includes pagination and sorting options.

Closes #123
```

```
fix(auth): resolve JWT expiration issue

JWT tokens were expiring immediately due to incorrect time calculation.
Updated to use seconds instead of milliseconds.

Fixes #456
```

## Testing Guidelines

### Writing Tests

```typescript
describe('PatientController', () => {
  describe('registerPatient', () => {
    it('should register a new patient successfully', async () => {
      // Arrange
      const patientData = { /* ... */ };

      // Act
      const result = await registerPatient(patientData);

      // Assert
      expect(result.status).toBe('success');
      expect(result.data.patient).toBeDefined();
    });

    it('should return error for invalid data', async () => {
      // Test error case
    });
  });
});
```

### Test Coverage

- Aim for 80%+ coverage
- Test happy paths and error cases
- Test edge cases
- Mock external dependencies

## Documentation

### Code Comments

```typescript
/**
 * Registers a new patient in the system
 *
 * @param patientData - Patient registration information
 * @returns Promise resolving to the created patient
 * @throws {AppError} If patient already exists
 */
async function registerPatient(patientData: PatientRegistration): Promise<Patient> {
  // Implementation
}
```

### API Documentation

When adding new endpoints:
1. Document in code with JSDoc
2. Add to API documentation
3. Include request/response examples
4. List possible error codes

## Review Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] New code has tests
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Branch is up to date with main

### Code Review Checklist

Reviewers will check:
- Code quality and style
- Test coverage
- Security considerations
- Performance implications
- Documentation completeness

## Security

### Reporting Security Issues

DO NOT open public issues for security vulnerabilities.

Email: security@yourhospital.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines
- Keep dependencies updated

## Questions?

- Open a discussion in GitHub Discussions
- Join our community chat
- Email: dev@yourhospital.com

Thank you for contributing!
