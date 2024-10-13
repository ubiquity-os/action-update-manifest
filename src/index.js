const { Octokit } = require("@octokit/core");
const { createAppAuth } = require("@octokit/auth-app");
const fs = require('fs');

// Get environment variables
const appId = process.env.APP_ID;
const privateKey = process.env.APP_PRIVATE_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const installationId = process.env.INSTALLATION_ID;
const useAppAuth = appId && privateKey;
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
const manifestPath = process.env.MANIFEST_PATH;
const commitMessage = process.env.COMMIT_MESSAGE;
const branch = process.env.GITHUB_REF_NAME;

let octokit;

// Conditional authentication
if (useAppAuth) {
    console.log("Authenticating as GitHub App...");
    octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId,
            privateKey,
            installationId,
        },
    });
} else {
    console.log("No APP_ID or APP_PRIVATE_KEY set, using GITHUB_TOKEN.");
    octokit = new Octokit({ auth: githubToken });
}

// Read the updated manifest file
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Get the default branch
octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
}).then(async ({ data: { default_branch } }) => {
    const branchToUse = branch || default_branch;

    // Get the latest commit SHA on the target branch
    const { data: { object: { sha: latestSha } } } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
        owner,
        repo,
        ref: `heads/${branchToUse}`,
    });

    // Create a new tree with the updated file
    const { data: { sha: newTreeSha } } = await octokit.request('POST /repos/{owner}/{repo}/git/trees', {
        owner,
        repo,
        tree: [{
            path: manifestPath,
            mode: '100644',
            type: 'blob',
            content: manifestContent,
        }],
        base_tree: latestSha,
    });

    // Create a new commit
    const { data: { sha: newCommitSha } } = await octokit.request('POST /repos/{owner}/{repo}/git/commits', {
        owner,
        repo,
        message: commitMessage,
        tree: newTreeSha,
        parents: [latestSha],
    });

    // Update the branch reference to point to the new commit
    await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
        owner,
        repo,
        ref: `heads/${branchToUse}`,
        sha: newCommitSha,
    });

    console.log(`Changes committed and pushed to ${branchToUse}`);
});
