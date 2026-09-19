# Contributing to ENTARC

Thank you for your interest in contributing to ENTARC! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps** which reproduce the problem
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** after following the steps
- **Explain which behavior you expected** to see instead
- **Include screenshots and animated GIFs** if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and **explain the expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript, React, and CSS styleguides
- End all files with a newline
- Include appropriate test coverage

## Development Setup

### Prerequisites

- Node.js 18+
- Yarn package manager
- Git
- Arc Testnet wallet (MetaMask or similar)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/entarc.git
   cd entarc/nextjs_space
   ```

2. Install dependencies
   ```bash
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Configure Arc Testnet in MetaMask
   - Chain ID: 5042002
   - RPC URL: https://rpc.testnet.arc.network
   - Currency: ARC
   - Explorer: https://testnet.arcscan.app

5. Start development server
   ```bash
   yarn dev
   ```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add Arc Node integration for protocol configuration

- Integrate protocol config ABI from Arc Node
- Update wagmi config with new chain parameters
- Add contract address constants

Closes #123
```

### TypeScript

- Use `const` for variables
- Use explicit return types for functions
- Use interfaces over types when possible
- Follow camelCase for variables and functions
- Use PascalCase for types and components

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names
- Add PropTypes or TypeScript types
- Add JSDoc comments for complex props

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Follow the project's color scheme
- Use responsive design patterns
- Keep custom CSS minimal

## Project Structure

```
entarc/nextjs_space/
├── app/               # Next.js app directory
├── components/        # React components
├── lib/              # Utilities and configuration
│   └── contracts/    # Smart contract ABIs and addresses
├── prisma/           # Database schema
├── public/           # Static assets
└── styles/           # Global styles
```

## Testing

- Write tests for new features
- Run `yarn test` before submitting a pull request
- Aim for at least 80% code coverage

## Documentation

- Update documentation when adding new features
- Include examples where appropriate
- Update the README if your changes affect how users use ENTARC

## Arc Node Integration

When integrating updates from Arc Node:

1. Review the latest changes in [Arc Node repository](https://github.com/circlefin/arc-node)
2. Update contract ABIs if necessary
3. Update network configuration
4. Test with local Arc testnet
5. Document changes in `ARC_NODE_INTEGRATION.md`

See `ARC_NODE_INTEGRATION.md` for detailed integration guidelines.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

Feel free to open an issue or reach out to us at connect@entarc.xyz

Thank you for contributing to ENTARC! 🚀
