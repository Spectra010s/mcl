# Contributing to My Campus Library

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and adhere to its principles.

## How to Contribute

### 1. Reporting Bugs

- Check if the bug has already been reported in [Issues](https://github.com/Spectra010s/mcl/issues)
- Provide a clear description of the bug
- Include steps to reproduce
- Describe expected vs actual behavior
- Include screenshots if applicable

### 2. Suggesting Features

- Check existing [Discussions](https://github.com/Spectra010s/mcl/discussions)
- Explain the feature and why it would be useful
- Provide examples of similar features
- Consider potential implementation approaches

### 3. Submitting Code Changes

#### Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/Spectra010s/mcl.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

#### Development

- Follow the existing code style
- Use TypeScript for type safety
- Add comments for complex logic
- Test your changes thoroughly

#### Code Style

- Use ESLint for TypeScript
- Format code with Prettier
- Use descriptive commit messages

#### Committing

```bash
git add .
git commit -m "feat: describe your changes clearly" -m "add more description if needed"
git push origin feature/your-feature-name
```
> Note: we use Vercel for deployments, To avoid wasting biuld minutes on no-code changes, please include `[skip deploy]` in your commit message.

Example: 
```bash 
git commit -m "docs: fix typo in README [skip deploy]"
```

#### Pull Request

1. Push your changes to your fork
2. Open a pull request with a clear title and description
3. Reference related issues using `keyword` `#issue-number`. Check for keywords [here](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issue/linking-a-pull-request-to-an-issue).
4. Wait for review and address feedback

### 4. Documentation

- Improve or create README, guides, or API docs
- Add comments to code
- Create tutorial or how-to guides
- Fix typos and clarity issues

## Development Guidelines

### Database Changes

- Always create a new migration script in `scripts/`
- Name migrations with timestamp: `03-add-new-feature.sql`
- Include comments explaining schema changes
- Test migrations in development

### Component Development

- Create reusable, well-documented components
- Use Tailwind CSS for styling
- Follow component naming conventions
- Add TypeScript types

### API Development

- Use RESTful conventions
- Add proper error handling
- Include request/response examples
- Document rate limiting if applicable

## Getting Help

- **Questions**: Post in [GitHub Discussions](https://github.com/Spectra010s/mcl/discussions)
- **Support Issues**: See [SUPPORT.md](SUPPORT.md)
- **Security**: Email [spectra010s@gmail.com](mailto:spectra010s@gmail.com)

## Recognition

Contributors will be recognized in:

- README contributors section
- Release notes for significant contributions
- Project acknowledgments

Thank you for contributing to My Campus Library!
