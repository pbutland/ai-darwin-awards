import { execSync } from 'child_process';

/**
 * Get the contents of a file as it exists in the latest commit (HEAD).
 * Returns null if the file does not exist in git.
 */
export function getCommittedFileContents(filePath: string): string | null {
  try {
    // Use git show to get the file at HEAD
    // filePath should be relative to the git root
    const output = execSync(`git show HEAD:${filePath}`, { encoding: 'utf8' });
    return output;
  } catch (err) {
    // File may not exist in git yet
    return null;
  }
}
