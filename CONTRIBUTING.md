# Contributing to NextQuad


Welcome to **NextQuad** - a verified campus community platform that connects NYU students with study spaces and each other. We’re building a safe, efficient, and collaborative environment for campus life management.


This document outlines how our team works, our expectations for contributions, and the steps to get started.


---


## Team Norms


Our team values **clear communication**, **collaboration**, and **accountability**. We aim to maintain a respectful, inclusive, and supportive environment where everyone’s input is valued.


**Team Norms**
- Communicate blockers early and openly.  
- Use clear, descriptive commit messages.  
- Attend sprint meetings and daily stand-ups.  
- Respect feedback - code reviews are collaborative, not personal.  
- Keep documentation updated when adding or changing features.


---


## Git Workflow


We follow a **Branch Synchronization Workflow** to keep our branches up to date with `main` while making individual edits.


**Branch Naming Conventions**
- `<name>-<description>` – your working branch for a specific feature or sprint  
- `feature/<short-description>` – for team feature branches  
- `docs/<short-description>` – for documentation updates  


**Workflow Steps**
1. Clone the repository to your local machine.  
2. Create or switch to your personal branch (e.g., `haroon-sprint0-wireframes`).  
3. Regularly sync your branch with the latest version of `main` using:  
   - `git fetch origin`  
   - `git checkout your-branch`  
   - `git merge master`  
   (This updates your branch with the newest changes from `main` without overwriting your work.)  
4. Make your edits and commit changes locally with clear messages.  
5. Push your branch to the remote repository using `git push origin your-branch`.  
6. Once your branch is finalized and tested, merge it into `main` (either via a pull request or direct merge if collaboration is complete).  


**Notes**
- This approach avoids unnecessary pull requests to the original (forked) repository (which would go to the assignment's master repo).  
- Always ensure your branch is up to date with `main` before making major edits or merges.  


---


## How to Contribute


Contributions are welcome in the following areas:  
- Building new features from the backlog.  
- Fixing reported bugs.  
- Improving documentation or UI/UX.  
- Writing unit tests or refactoring existing code.


Before contributing:  
- Review open issues or discuss your idea with the team.  
- Follow existing style and formatting conventions.  
- Do not commit directly to `main`.


---


## Setting Up Your Local Environment


Everyone taking this course ideally would already have completed setup, but if you haven't, here's a refresher:


1. Ensure Node.js and npm are installed on your system.  
2. Clone the repository using the GitHub link.  
3. Navigate into the project folder.  
4. Install dependencies with `npm install`.  
5. Run the development server with `npm start`.  
6. Open your browser and go to `http://localhost:3000` (or whatever port it's hosted on on your computer).


---


## Building and Testing


As the project evolves, build and test instructions will be updated here.


For now:  
- Ensure your code runs locally without breaking existing features.  
- Write meaningful commit messages describing what you changed and why.  
- Run linting or formatting checks before pushing.


---


## Code Review Process


Each Pull Request must:  
- Include a clear description of the changes.  
- Pass build and linting checks.  
- Be reviewed and approved by at least one team member.  
- Include tests or screenshots where applicable.


Feedback should be constructive and focused on improving the codebase.


---


## Future Expansion


While NextQuad is built for **NYU students**, our long-term vision is to scale the platform to other universities.  
Each campus will have its **own private, verified community**, ensuring trust, safety, and exclusivity across institutions.


---


## Contact


**Team NextQuad**  
Developers: Polaris Wu, Xiaohan Zhou, Laura Liu, Milan Engineer, Haroon Shafi  
Scrum Master: Polaris Wu  
Product Owner: Xiaohan Zhou
