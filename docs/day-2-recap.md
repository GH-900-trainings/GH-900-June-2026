# 📚 Day 2 Recap

<style>
a {
    text-decoration: none;
    color: #464feb;
}
tr th, tr td {
    border: 1px solid #e6e6e6;
}
tr th {
    background-color: #f5f5f5;
}
</style>

## Overview

Day 2 focused on moving beyond the basics of Git and GitHub and into real-world collaboration, security, automation, and software delivery. The session demonstrated how GitHub supports the complete software development lifecycle—from contributing to open-source projects, managing repositories securely, automating testing, and delivering applications through continuous integration and continuous delivery (CI/CD).

The training used a practical Node.js web application and GitHub repositories to demonstrate concepts rather than relying solely on slides, making it easier to understand how these features are used in real projects.

# 1. Open Source Contributions and InnerSource

## What We Learned

We explored how developers contribute to open-source projects using:

- Fork
- Clone
- Pull Requests (PRs)
- GitHub Flow

A key takeaway was understanding the difference between:

### Fork

Creates a copy of another repository under your own account or organization.

Useful when:

- Contributing to open-source projects
- You do not have direct write access to the original repository

### Pull Request

Allows you to propose changes from:

- Your fork → Original repository
- Your branch → Main branch

The repository maintainers can then review, discuss, and approve your changes.

## Real-World Use Cases

### Open Source Contribution

You discover a typo in documentation or a bug in an open-source library.

You can:

1. Fork the repository
2. Make your changes
3. Submit a Pull Request

### Community Growth

Contributing to projects:

- Builds your GitHub portfolio
- Demonstrates coding ability
- Helps grow professional visibility

### InnerSource (Inside Organizations)

Organizations can use the same open-source model internally:

- Teams fork internal repositories
- Submit Pull Requests
- Collaborate across departments

This helps reduce silos and increases code sharing.

# 2. Repository Security

Security was a major topic during Day 2.

## Protecting Code

Important practices include:

### Branch Protection

Protect important branches such as:

- main
- production

Prevent:

- Direct pushes
- Accidental code changes
- Unreviewed commits

### Private vs Public Repositories

Public repositories expose:

- Source code
- Documentation

Private repositories should be used when:

- Source code is confidential
- Company intellectual property is involved

## Why Security Matters

The class discussed the Log4j vulnerability example.

Key lesson:

Even trusted open-source libraries can contain security vulnerabilities.

Developers must:

- Monitor dependencies
- Apply updates
- Scan for vulnerabilities regularly

## Real-World Use Case

Imagine a customer-facing application using:

- Thousands of lines of code
- Hundreds of third-party libraries

A vulnerability in just one dependency could expose:

- Customer data
- Business systems
- Cloud resources

GitHub provides tools to help minimize these risks.

# 3. Dependency Security with Dependabot

## Dependabot

Dependabot scans project dependencies and identifies:

- Vulnerable packages
- Outdated libraries
- Available upgrades

It can even:

- Create Pull Requests automatically
- Suggest version upgrades

## Benefits

### Security Improvements

Alerts you when:

- A library contains known vulnerabilities

### Easier Maintenance

No need to manually check every dependency.

### Automated Updates

Dependabot can:

- Open Pull Requests
- Provide changelogs
- Recommend versions

## Real-World Use Case

A Node.js application may rely on dozens of npm packages.

Instead of manually monitoring every package, Dependabot becomes an automated security assistant.

# 4. Managing Secrets

One of the most important lessons of the day was:

**Never store secrets in source code.**

Examples:

- API Keys
- Access Tokens
- Passwords
- Connection Strings

## .env Files

Local development often stores secrets in:

.env

However, these files should not be committed to GitHub.

## .gitignore

The `.gitignore` file prevents sensitive files from entering source control.

Common entries:

.env
node_modules
logs

## GitHub Secret Scanning

GitHub can detect:

- Tokens
- API keys
- Credentials

and alert repository owners automatically.

## Real-World Use Case

When deploying cloud applications:

- Azure Maps
- Azure OpenAI
- Azure AI Services

All use API keys.

Keeping those secrets out of GitHub helps prevent abuse and unexpected cloud charges.

# 5. GitHub Actions and CI/CD

This was one of the largest sections of Day 2.

## What is GitHub Actions?

GitHub Actions allows automation of:

- Builds
- Testing
- Security scans
- Deployments

using workflows written in YAML files.

## Workflow Triggers

Examples:

- Push to main
- Pull Request creation
- Scheduled execution

## GitHub Hosted Runners

GitHub provides managed virtual machines that can:

- Build code
- Run tests
- Execute workflows

Supported platforms:

- Windows
- Linux
- macOS

## Self-Hosted Runners

Organizations can use their own infrastructure.

Advantages:

- Full control
- Custom software
- Internal environments

## Real-World Use Cases

### Continuous Integration

Every Pull Request:

- Compiles code
- Executes tests
- Detects failures before merging

### Quality Gates

Prevent broken code from entering production.

### Automated Validation

Verify:

- APIs
- Dependencies
- Configuration

before deployment.

# 6. Unit Testing

The project introduced automated testing.

## Why Unit Tests Matter

Manually testing software every release does not scale.

Unit tests help:

- Detect regressions
- Validate business logic
- Verify existing functionality

## Evolution of Testing

Instead of:

- Testing once

Teams can:

- Test continuously

through GitHub Actions.

## Real-World Use Case

Whenever a developer modifies code:

GitHub Actions automatically:

- Runs tests
- Confirms expected behavior
- Protects production quality

# 7. CodeQL Security Scanning

## What is CodeQL?

GitHub’s security analysis tool.

It scans source code looking for:

- Vulnerabilities
- Unsafe coding patterns
- Security risks

## Benefits

Detect issues before applications reach production.

Supports:

- Shift-left security

Meaning:

Find problems earlier in the development lifecycle.

## Real-World Use Case

Instead of discovering vulnerabilities after release:

Security scanning becomes part of every Pull Request.

# 8. Software Packaging and Delivery

After building and testing software, we explored delivery mechanisms.

## GitHub Container Registry

Applications can be packaged as Docker images and stored in GitHub Packages.

Benefits:

- Versioned releases
- Portable deployments
- Easy distribution

## Docker

The application was packaged into a container image.

This allows deployment to:

- Azure Container Apps
- Kubernetes
- Virtual Machines
- Docker Hosts

## Real-World Use Case

A development team builds an application once.

The same container image can then be deployed consistently across:

- Development
- Testing
- Production

environments.

# 9. GitHub Search and Productivity Features

## Search Filters

GitHub supports advanced filtering for:

- Issues
- Pull Requests
- Discussions

Examples:

- Open items
- Assigned items
- Specific labels

## Git Blame

Despite the name, Git Blame is not about blaming people.

It helps identify:

- Who made a change
- When the change was made
- Which commit introduced it

## Auto-Link References

Work items can be linked using issue numbers.

Benefits:

- Better traceability
- Easier collaboration
- Improved project tracking

# 10. GitHub Administration and Enterprise Features

Topics covered included:

- Authentication
- Authorization
- Team Management
- SAML Single Sign-On
- Team Synchronization
- Multi-Factor Authentication (MFA)

## Key Takeaway

Use the principle of:

**Least Privilege Access**

People should only receive permissions necessary for their roles.

# 11. Certification Preparation

The training concluded with:

- GH-900 exam discussion
- Practice assessments
- Review of exam topics

Areas emphasized:

- Git fundamentals
- Repository management
- Pull Requests
- Security
- GitHub Actions
- Administration

# Key Student Takeaways

By the end of Day 2, you should understand how to:

✅ Contribute to open-source projects using Forks and Pull Requests

✅ Secure repositories with Branch Protection and Secret Scanning

✅ Use Dependabot for dependency management

✅ Store secrets safely using GitHub Secrets

✅ Create CI/CD pipelines using GitHub Actions

✅ Run automated tests and security scans

✅ Package applications using Docker

✅ Publish software through GitHub Packages

✅ Manage users, teams, and permissions

✅ Prepare for the GH-900 GitHub Foundations certification

# Links Shared During the Session

## Certification & Learning

- [GitHub Foundations Certification](https://learn.microsoft.com/en-us/credentials/certifications/github-foundations)
- [GitHub Foundations Practice Assessment](https://learn.microsoft.com/en-us/credentials/certifications/github-foundations/practice/assessment?assessment-type=practice&assessmentId=954809103&practice-assessment-type=certification)
- [GitHub Actions Certification (GH-200)](https://learn.microsoft.com/en-us/credentials/certifications/github-actions/?practice-assessment-type=certification)

## Training Repositories

- [GH-900 Training Repository](https://github.com/GH-900-trainings/GH-900-June-2026)
- [Log4j Fork Repository](https://github.com/GH-900-trainings/logging-log4j2)

## Open Source References

- [Apache Software Foundation Projects](https://www.apache.org/projects/)
- [Apache Log4j Repository](https://github.com/apache/logging-log4j2)

## GitHub Markdown

- [GitHub Markdown Emoji Reference](https://gist.github.com/rxaviers/7360908)

## Labs

### Lab 6 – Create Your First Pull Request

- [Microsoft Learn Lab](https://learn.microsoft.com/en-us/training/modules/contribute-open-source/4-exercise-create-pr)

### Lab 7 – InnerSource Fundamentals

- [Microsoft Learn Lab](https://learn.microsoft.com/en-us/training/modules/manage-innersource-program-github/3-innersource-fundamentals)

### Lab 8 – Secure Your Repository Supply Chain

- [Microsoft Learn Lab](https://learn.microsoft.com/en-us/training/modules/maintain-secure-repository-github/3-security-strategy-essentials)

### Lab 9 – Reviewing Pull Requests

- [Microsoft Learn Lab](https://learn.microsoft.com/en-us/training/modules/manage-changes-pull-requests-github/3-review-pull-requests)

### Lab 10 – Set Up GitHub Copilot with VS Code

- [Microsoft Learn Lab](https://learn.microsoft.com/en-us/training/modules/introduction-copilot-python/3-exercise-setup)

### Lab 11 – Update a Python Web API with GitHub Copilot

- [Microsoft Learn Lab](https://learn.microsoft.com/en-us/training/modules/introduction-copilot-python/5-exercise-python-web-api)

## Additional Resources

- [GitHub Gist Example](https://gist.github.com/msftnutta/9cba63b13b3f46d9e232bec0167784ab)
