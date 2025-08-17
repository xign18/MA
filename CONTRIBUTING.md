# Contributing to Vehicle Maintenance Management System

Thank you for your interest in contributing to the Vehicle Maintenance Management System! This document provides guidelines and information for contributors.

## 🎯 **How to Contribute**

### **Types of Contributions**
- 🐛 **Bug Reports** - Help us identify and fix issues
- ✨ **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve or add documentation
- 🔧 **Code Contributions** - Submit bug fixes or new features
- 🎨 **UI/UX Improvements** - Enhance user experience
- 🧪 **Testing** - Add or improve test coverage

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git
- Supabase account (for database testing)

### **Development Setup**
1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/vehicle-maintenance-system.git
   cd vehicle-maintenance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 **Development Guidelines**

### **Code Style**
- **TypeScript** - Use TypeScript for all new code
- **ESLint** - Follow the existing ESLint configuration
- **Prettier** - Code formatting is handled automatically
- **Naming Conventions** - Use descriptive, camelCase variable names
- **Comments** - Add JSDoc comments for functions and complex logic

### **Component Guidelines**
```typescript
// ✅ Good - Descriptive component with proper typing
interface UserProfileProps {
  user: User
  onUpdate: (user: User) => void
  isEditing?: boolean
}

export function UserProfile({ user, onUpdate, isEditing = false }: UserProfileProps) {
  // Component implementation
}

// ❌ Avoid - Unclear props and missing types
export function Profile({ data, callback, flag }) {
  // Implementation
}
```

### **Database Guidelines**
- **Migrations** - Always create migrations for schema changes
- **RLS Policies** - Maintain Row Level Security policies
- **Indexes** - Add appropriate indexes for performance
- **Naming** - Use snake_case for database columns

### **Git Workflow**
1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with clear, atomic commits
   ```bash
   git commit -m "feat: add timeline milestone filtering"
   ```

3. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** with a clear description

## 🐛 **Bug Reports**

### **Before Submitting**
- Check existing issues to avoid duplicates
- Test with the latest version
- Gather relevant information (browser, OS, steps to reproduce)

### **Bug Report Template**
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 2.0.0]
```

## ✨ **Feature Requests**

### **Feature Request Template**
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How would you like this feature to work?

**Alternatives Considered**
Any alternative solutions you've considered.

**Additional Context**
Any other context or screenshots about the feature.
```

## 🔧 **Code Contributions**

### **Pull Request Guidelines**
- **Clear Title** - Use descriptive titles (e.g., "feat: add timeline filtering")
- **Description** - Explain what changes you made and why
- **Testing** - Ensure your changes work and don't break existing functionality
- **Documentation** - Update documentation if needed
- **Small PRs** - Keep pull requests focused and reasonably sized

### **Commit Message Format**
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(timeline): add milestone filtering functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

## 🧪 **Testing**

### **Running Tests**
```bash
npm run test:system    # Run system tests
npm run lint          # Check code style
npm run build         # Verify build works
```

### **Testing Guidelines**
- **Test your changes** - Ensure new features work as expected
- **Test existing functionality** - Make sure you didn't break anything
- **Test different roles** - Verify admin, supervisor, and technician access
- **Test responsive design** - Check mobile and desktop layouts

## 📝 **Documentation**

### **Documentation Updates**
- Update README.md for new features
- Add JSDoc comments for new functions
- Update API documentation in `docs/API.md`
- Add examples for new functionality

### **Documentation Style**
- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI changes
- Keep documentation up to date with code changes

## 🎨 **UI/UX Guidelines**

### **Design Principles**
- **Consistency** - Follow existing design patterns
- **Accessibility** - Ensure features are accessible
- **Responsive** - Design works on all screen sizes
- **User-Friendly** - Intuitive and easy to use

### **Tailwind CSS**
- Use existing utility classes when possible
- Follow the established color scheme
- Maintain consistent spacing and typography
- Use dark mode classes for theme support

## 🚦 **Review Process**

### **What We Look For**
- **Code Quality** - Clean, readable, well-structured code
- **Functionality** - Features work as intended
- **Testing** - Changes are properly tested
- **Documentation** - Appropriate documentation updates
- **Performance** - No significant performance regressions

### **Review Timeline**
- Initial review within 2-3 business days
- Follow-up reviews within 1-2 business days
- Merge after approval and passing checks

## 🤝 **Community Guidelines**

### **Code of Conduct**
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the code, not the person

### **Getting Help**
- **GitHub Discussions** - Ask questions and discuss ideas
- **GitHub Issues** - Report bugs or request features
- **Documentation** - Check existing documentation first

## 🏆 **Recognition**

Contributors will be recognized in:
- **README.md** - Contributors section
- **CHANGELOG.md** - Feature attribution
- **GitHub** - Contributor graphs and statistics

Thank you for contributing to the Vehicle Maintenance Management System! 🚗✨
