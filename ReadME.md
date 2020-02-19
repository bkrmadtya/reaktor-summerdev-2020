# Reaktor Software Developer Summer 2020

## Pre-assignment for junior developer positions

## Instructions

On a Debian and Ubuntu systems, there is a file called /var/lib/dpkg/status that holds information about software packages that the system knows about. Write a small program in a programming language of your choice that exposes some key information about packages in the file via an HTML interface.

The index page lists installed packages alphabetically with package names as links.
When following each link, you arrive at a piece of information about a single package. The following information should be included:

- Name
- Description
- The names of the packages the current package depends on (skip version numbers)
- Reverse dependencies, i.e. the names of the packages that depend on the current package
- The dependencies and reverse dependencies should be clickable and the user can navigate the package structure by clicking from package to package.
- The application must be available publicly on the internet. You can, for example, use Heroku to host it for free. Provide a link to the website in your job application.
- The source code must also be available publicly in GitLab or GitHub, and a link provided in your job application.

#### Some things to keep in mind

- Minimize the use of external dependencies. The goal of the assignment is to view how you solve the problems with the programming language, not how well you use package managers. 🙂
- Please keep the code simple and sweet. The main design goal of this program is maintainability. We value the simplicity and readability of the code over the number of features.
- Only look at the Depends field. Ignore other fields that work kind of similarly, such as Suggests and Recommends.
- Sometimes there are alternates in a dependency list, separated by the pipe character |. When rendering such dependencies, render any alternative that maps to a package name that has an entry in the file as a link and just print the name of the package name for other packages.
- The section “Syntax of control files” of the Debian Policy Manual applies to the input data.
  Make sure your solution runs on non-Debian systems as well. You can use the sample file as mock data.

---

#### Tools used:

- Node.js
- Express
- HTML
- CSS

#### Approach to solution

##### Server

When the server gets request for the file

- The server detects the operating system of the machine **(process.platform)**
- If the os contains 'linux' eg. **'linux xxxx'**, then the file path is set to **/var/lib/dpkg/status**
- For other os, the sample file path is set to **status.real** in the project directory
- The file is read from the file path and send to the client

##### Client

- The file is fetched as text when the html loads
- The file is splitted into array based on two consecutive line breaks (As per **Syntax of control files** of the Debian Policy Manual)
- Each item of the array is parsed into required data using regex into
  - name,
  - dependencies
  - description
- Name is parsed based on line that starts with **Package:** and following line break
- Dependencies are parsed based on the line that starts with **Depends:** and following line break
- The dependencies are further splitted into array based on **","** (comma) and brackets and version number are removed from them
- Description is parsed based on line that startw with **Depends:** and since, description contains information in more than one line, the end of the description of has following options:
  - End of the package i.e. **two consecutive line brakes** if there is no further information or,
  - A line brake and **Original-Maintainer:** or **Homepage:** info in the next line
- Reverse dependecies are added as a list inside each package element in the array based on the the use of that package in other packages
- The name of each package is displayed as link in a table in the html page
- When the link is clicked the any optional
  - dependencies separated by **"|"** is removed to keep the dependency that is on the list of packages and
  - the packages' detailed information is displayed in the html page
- The dependencies and reverse dependencies are displayed as link which can clicked to view the dependency's detailed information

**To run the project locally**

- Clone the repository
- npm install
- Go to http://localhost:3005
- Sample website at: https://glacial-fortress-06676.herokuapp.com

**NB:**
The sample website is hosted on a linux system with heroku hence, it will show the information of the server system from its **/var/lib/dpkg/status**

**@Bikram Karki 2020**
