# 📚 Day 1 Recap

## GH-900 Day 1 Student Recap: GitHub Foundations

Today’s session introduced the core ideas behind GitHub and how it supports modern software development. The training focused on why teams use version control, how GitHub helps teams collaborate, and how tools like GitHub Copilot, Codespaces, projects, code scanning, and Markdown can make development work easier, safer, and more organized.

---

## 1. Why version control matters

The day started with a simple but important question: **why do we need version control?**

When multiple developers work on the same application, they may change the same codebase at the same time. Without version control, one person’s changes can accidentally overwrite another person’s work. This can lead to confusion, lost code, and delays.

Version control helps by:

- Tracking who changed what
- Keeping a history of changes
- Allowing teams to roll back if something breaks
- Helping multiple people work in parallel
- Supporting safe review before changes are merged

A useful way to think about this is: version control protects the project from “where did my code go?” moments.

---

## 2. Git vs GitHub

The session explained the difference between **Git** and **GitHub**.

**Git** is the open-source version control system. It can track file changes and manage code history.

**GitHub** is a cloud platform built around Git. It provides a user-friendly interface and many collaboration features, such as:

- Repositories
- Branches
- Pull requests
- Issues
- Projects
- Discussions
- Actions
- Codespaces
- Copilot
- Security and code scanning features

In simple terms:

> Git is the version control engine. GitHub is the platform that makes Git easier to use with teams.

---

## 3. Repositories, organizations, and teams

Students saw how a GitHub organization can be created and used to group repositories and team members.

A **repository**, often called a “repo,” is where the project files live. It can contain:

- Source code
- Documents
- README files
- License files
- Issues
- Pull requests
- Wiki content
- Project boards

An **organization** helps manage multiple repositories and people in one place. This is useful when a company or team has several projects.

A **team** inside an organization can be used to control access. For example, one team may have access to one repo, while another team may have access to a different repo.

### Student use-case

If your company has several development teams, you can create one GitHub organization for the company, then separate repositories for each application or service. Teams can then be given access only to the repositories they need.

---

## 4. GitHub issues and project planning

The training demonstrated how to use **issues** to track work.

Issues can represent:

- Tasks
- Bugs
- Enhancements
- Feature requests
- Investigation items

The demo project used issues to plan a simple web application. Example work items included creating a Node.js application, displaying local times for multiple cities, improving the interface, adding tests, and preparing automation.

GitHub Projects were also used to organize work visually using a board. Items could move through stages such as backlog, in progress, review, and done.

### Why this is useful

A project board helps everyone see:

- What needs to be done
- What is currently being worked on
- What is waiting for review
- What has been completed

### Student use-case

For a team project, you can create a project board and add issues for each task. This gives the whole team one shared view of progress instead of tracking work through separate chats or spreadsheets.

---

## 5. Branches and pull requests

One of the key concepts covered was the **GitHub Flow**.

The main branch should usually be protected because it represents the stable version of the code. Instead of changing the main branch directly, developers create a new branch for their work.

The typical flow is:

1. Start from the main branch
2. Create a new branch
3. Make changes in that branch
4. Commit the changes
5. Push the branch to GitHub
6. Open a pull request
7. Review the changes
8. Merge into the main branch after approval

A **pull request** is a request to bring changes from one branch into another branch. It allows team members to review the code before it becomes part of the main application.

### Why this matters

Pull requests help improve quality because the team can check the code before it goes into the main branch. This is especially useful when working with production applications or shared codebases.

### Student use-case

If you are fixing a bug in a customer-facing application, create a branch for the fix, then open a pull request. This gives the team a chance to review and test the change before it is merged.

---

## 6. GitHub Copilot for development

The session introduced GitHub Copilot as an AI coding assistant that can help with software development tasks.

Copilot was used in different ways:

- Writing code
- Updating a simple web application
- Improving the user interface
- Creating a README file
- Helping explain the project
- Creating a pull request from a bug issue

Students saw that Copilot can work inside Visual Studio Code and can also help through GitHub by creating branches and pull requests.

However, the session also highlighted an important point: AI should be used carefully. Developers should still review the code, understand the changes, and make sure it follows company policies.

### Student use-case

You can use Copilot to quickly create a starter web application, generate repetitive code, explain unfamiliar code, or suggest fixes. But before accepting the output, always review it for correctness, security, and maintainability.

---

## 7. Code scanning and CodeQL

The session introduced code scanning as a way to improve security and code quality.

Code scanning can help detect potential problems in source code, such as:

- Security risks
- Poor coding patterns
- Vulnerabilities
- Quality issues

CodeQL was discussed as one of the tools that can be used for code scanning in GitHub.

The key message was that security should not be treated as something that happens only at the end of a project. It is better to bring security earlier into the development process.

### Student use-case

If your team builds business-critical applications, configure code scanning so that every pull request is checked before the code is merged. This helps catch issues earlier and reduces the risk of introducing insecure code.

---

## 8. GitHub Codespaces and GitHub.dev

The training compared **GitHub Codespaces** and **GitHub.dev**.

**GitHub Codespaces** gives you a cloud-based development environment. It includes compute resources, a terminal, and the ability to run and test applications in the browser.

**GitHub.dev** is a lighter browser-based editor. It is useful for quick edits, but it does not provide the same compute environment as Codespaces.

### Simple comparison

| Tool | Best for | Key idea |
| --- | --- | --- |
| GitHub Codespaces | Coding, running, and testing apps in the browser | Full cloud development environment |
| GitHub.dev | Quick edits in the browser | Lightweight code editor |

### Student use-case

Codespaces is helpful when onboarding new team members. Instead of asking everyone to install the same software, tools, and extensions locally, the team can provide a ready-to-use browser-based environment.

---

## 9. Markdown and README files

The session ended with Markdown and how it helps teams communicate inside GitHub.

A **README.md** file is usually the first thing people see when they open a repository. It should explain what the project is, how to run it, and what the project structure looks like.

Markdown can be used for:

- Headings
- Bullet points
- Links
- Code blocks
- Images
- Tables
- Basic documentation

A good README makes a repository easier to understand, especially for new contributors.

### Student use-case

If you create a project, always include a README file. Add the purpose of the project, setup instructions, how to run it, and any important notes. This saves time for your future self and for anyone else joining the project.

---

## 10. Practical demo application built during the session

During the session, a simple web application was created as a demo. The goal was to show local time for different cities.

The demo included:

- Creating a GitHub organization
- Creating a repository
- Adding issues to track work
- Creating a project board
- Cloning the repository locally
- Building a Node.js application
- Adding cities and local time display
- Improving the user interface with Tailwind CSS
- Creating branches
- Opening and merging pull requests
- Using GitHub Copilot to help with code changes
- Updating the README file using Markdown

This demo helped connect the GitHub concepts with a real development workflow.

---

## 11. Key takeaways from Day 1

By the end of Day 1, students should understand that GitHub is more than just a place to store code. It can support the full development workflow, from planning to coding, reviewing, securing, documenting, and collaborating.

Main takeaways:

- Use repositories to store and manage project files.
- Use issues to track tasks, bugs, and enhancements.
- Use project boards to organize work visually.
- Use branches to work safely without changing the main branch directly.
- Use pull requests for review and quality control.
- Use branch protection to protect important code.
- Use Copilot to help write, explain, and improve code, but always review the result.
- Use code scanning to bring security earlier into the workflow.
- Use Codespaces when you need a ready-to-use cloud development environment.
- Use Markdown and README files to document your project clearly.

---

## 12. Recommended real-world use-cases for students

Here are some practical ways students can apply what was learned today.

### Use-case 1: Team project management

Use GitHub Issues and GitHub Projects to manage a team software project. Each task can be created as an issue and tracked on a board.

This helps the team see what is planned, what is in progress, and what is completed.

---

### Use-case 2: Safe bug fixing

When fixing a bug, create a dedicated branch instead of changing the main branch directly. After fixing the bug, open a pull request for review.

This reduces the chance of breaking the main application.

---

### Use-case 3: New developer onboarding

Use a README file and Codespaces to help new team members get started faster.

The README explains the project, while Codespaces provides a ready development environment in the browser.

---

### Use-case 4: AI-assisted development

Use GitHub Copilot to generate starter code, explain unfamiliar code, or suggest improvements.

This can save time, especially for repetitive tasks, but the developer should still review and test the output.

---

### Use-case 5: Security-first development

Enable code scanning early in the project. This helps detect risks before the code is merged or released.

This is especially useful for applications that handle customer data, internal business data, or production workloads.

---

### Use-case 6: Better documentation

Use Markdown to write clear documentation directly inside the repository.

Good documentation helps the team avoid repeated questions and makes the project easier to maintain.

---

## Links shared during the session

### Profile and course information

- [Trainer LinkedIn profile](https://www.linkedin.com/in/nutwongaree/)
- [GH-900: GitHub Foundations certification page](https://learn.microsoft.com/en-us/credentials/certifications/github-foundations)

### Git and GitHub resources

- [Git official website](https://git-scm.com/)
- [GH-900 training organization](https://github.com/GH-900-trainings)
- [GH-900 June 2026 demo repository](https://github.com/GH-900-trainings/GH-900-June-2026)

### Azure Animations resources

- [Azure Animations homepage](https://aka.ms/AzureAnimations)
- [Git Version Control and GitHub Flow animation](https://azureanimations.github.io/github/git-version-control)

### Day 1 lab links

- [Lab 1: A guided tour of GitHub](https://learn.microsoft.com/en-us/training/modules/introduction-to-github/6-guided-tour-of-github)
- [Lab 2: Configure code scanning exercise](https://learn.microsoft.com/en-us/training/modules/configure-code-scanning/5-exercise)
- [Lab 3: Develop with AI-powered code suggestions by using GitHub Copilot and Visual Studio Code](https://learn.microsoft.com/en-us/training/modules/introduction-to-github-copilot/5-exercise)
- [Lab 4: Code with Codespaces and Visual Studio Code](https://learn.microsoft.com/en-us/training/modules/code-with-github-codespaces/5-exercise-code-with-codespaces)
- [Lab 5: Communicate using Markdown](https://learn.microsoft.com/en-us/training/modules/communicate-using-markdown/3-communicating-using-markdown)

---

## Suggested next step after Day 1

After today’s session, students may want to revisit the labs and practice the full workflow again:

1. Create a repository
2. Create issues
3. Create a branch
4. Make a change
5. Open a pull request
6. Merge the change
7. Update the README

This will help reinforce the GitHub workflow before moving into more automation and advanced topics on Day 2.
