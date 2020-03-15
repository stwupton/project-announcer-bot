import { Project } from "../storage";

export default function projectListItem(project: Project, index: number): string {
  const due = new Date(project.due);
  return `
**${index}. ${project.title}**
\`\`\`
Description: ${project.description}
Due: ${due.toDateString()}
\`\`\`
`
}