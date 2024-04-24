import Netlify from 'netlify-auth-providers';
import { Octokit } from '@octokit/rest';
import utf8 from 'utf8';

const SCOPES = ['repo', 'user', 'read:org'];

const encode = (s) => btoa(utf8.encode(s));
const decode = (b) => utf8.decode(atob(b));

// This is basically a null set of protections, just to get rid of that
// annoying, "You haven't protected your main branch!" warning on the website.
// We'd kinda like to require pull requests to main except that our own code
// wants to directly create files in main. I think in theory if this was a
// proper GitHub App, I might be able to allow the app to do it while otherwise
// requiring PRs. Something to investigate later.
const mainBranchProtections = {
  required_status_checks: null,
  enforce_admins: true,
  restrictions: null,
  required_pull_request_reviews: null,
  required_linear_history: false,
  allow_force_pushes: false,
  allow_deletions: false,
  block_creations: false,
  required_conversation_resolution: false,
};

const always = (x) => () => x;

const getToken = () => sessionStorage.getItem('githubToken');

const setToken = (t) => sessionStorage.setItem('githubToken', t);

const removeToken = () => sessionStorage.removeItem('githubToken');

const token = async (siteId) => {
  const t = getToken();
  if (t !== null) return t;

  const config = { site_id: siteId };
  const auth = { provider: 'github', scope: SCOPES };

  return new Promise((resolve, reject) => {
    new Netlify(config).authenticate(auth, (err, data) => {
      if (err) reject(err);
      setToken(data.token);
      resolve(data.token);
    });
  });
};

/*
 * Utility for handling response objects from GitHub API. (Hmmm, maybe it's the
 * octokit/core.request method that's wrapping up the HTTP status and headers.
 * Anyway, this deal with that, more or less.
 */
const if200 = (r) => {
  if (200 <= r.status && r.status < 300) {
    return r.data;
  }
  throw r;
};

const if404 = (value) => (r) => {
  if (r.status === 404) {
    return value;
  }
  throw r;
};

/*
 * Wrapper over the octokit object and the fetched user data so by the time one
 * of these is constructed we know we have sucessfully logged in and retrieved
 * the information about who we are. It then gives us the entry points to get at
 * repos belonging to this user. (Could obviously be fleshed out to deal with
 * other aspects of the logged in user but I don't need any of them yet.) Could
 * also add methods for getting at other people's repos.
 */
class Github {
  constructor(octokit, user) {
    this.octokit = octokit;
    this.user = user;
    this.userRepos = new RepoOwner(octokit, this.user.login);

    // This is a total kludge unrelated to github.
    if (user == 'gigamonkey') {
      localStorage.setItem('showOutlineDetails', 'yes');
    }
  }

  membership(org) {
    const url = 'GET /user/memberships/orgs/{org}';
    return this.octokit.request(url, { org }).then(if200).catch(if404(false));
  }

  orgRepos(org) {
    return new RepoOwner(this.octokit, org);
  }

  getRepo(...args) {
    return this.userRepos.getRepo(...args);
  }

  makeRepo(...args) {
    return this.userRepos.makeRepo(...args);
  }

  makeRepoFromTemplate(...args) {
    this.userRepos.makeRepoFromTemplate(...args);
  }

  repoExists(...args) {
    return this.userRepos.repoExists(...args);
  }
}

class RepoOwner {
  constructor(octokit, owner) {
    this.octokit = octokit;
    this.owner = owner;
  }

  // N.B. this method only works if the owner is an org.
  async listRepos() {
    const url = 'GET /orgs/{owner}/repos';
    return this.octokit
      .request(url, { owner: this.owner })
      .then(if200)
      .then((data) => data.map((d) => new Repo(this.octokit, d)));
  }

  async getRepo(name) {
    const url = 'GET /repos/{owner}/{name}';
    return this.octokit
      .request(url, { owner: this.owner, name })
      .then(if200)
      .then((data) => new Repo(this.octokit, data));
  }

  async makeRepo(name) {
    const url = 'POST /user/repos';
    return this.octokit
      .request(url, { name })
      .then(if200)
      .then((data) => new Repo(this.octokit, data));
  }

  async makeRepoFromTemplate(name, templateOwner, templateRepo) {
    const url = 'POST /repos/{template_owner}/{template_repo}/generate';
    return this.octokit
      .request(url, {
        template_owner: templateOwner,
        template_repo: templateRepo,
        owner: this.owner,
        name,
        description: `Repo made from ${templateOwner}/${templateRepo}`,
        include_all_branches: true,
      })
      .then(if200)
      .then((data) => new Repo(this.octokit, data));
  }

  async repoExists(name) {
    return this.getRepo(name).then(always(true)).catch(always(false));
  }
}

/*
 * Thin wrapper over the GitHub API repository object.
 */
class Repo {
  constructor(octokit, raw) {
    this.octokit = octokit;
    this.raw = raw;
    // Extract a few bits we're going to need a lot.
    this.owner = raw.owner.login;
    this.name = raw.name;
    this.url = raw.html_url;
  }

  fileExists(path, ref) {
    return this.requestFile('HEAD', path, ref).then(always(true)).catch(if404(false));
  }

  getFile(path, ref) {
    return this.requestFile('GET', path, ref);
  }

  getFileContent(path, ref) {
    return this.getFile(path, ref).then((file) => decode(file.content));
  }

  requestFile(method, path, ref) {
    const { owner, name } = this;
    const url = `${method} /repos/{owner}/{name}/contents/{path}`;
    return this.octokit
      .request(url, {
        owner,
        name,
        path,
        ref,
        headers: {
          // Magic to defeat caching since the actual object pointed to by the path
          // can change if ref is a branch name.
          'If-None-Match': '',
        },
      })
      .then(if200);
  }

  /*
   * Create a file with the given contents as a string.
   */
  createFile(path, message, content, branch) {
    const { owner, name } = this;
    const url = 'PUT /repos/{owner}/{name}/contents/{path}';
    return this.octokit
      .request(url, { owner, name, path, message, content: encode(content), branch })
      .then(if200);
  }

  updateFile(path, message, content, sha, branch) {
    const { owner, name } = this;
    const url = 'PUT /repos/{owner}/{name}/contents/{path}';
    return this.octokit
      .request(url, { owner, name, path, message, content: encode(content), sha, branch })
      .then(if200);
  }

  fileRevisions(path, shaOrBranch) {
    const { owner, name } = this;
    console.log('fetching file revisions');
    const url = 'GET /repos/{owner}/{name}/commits';
    return this.octokit.paginate(url, {
      owner,
      name,
      path,
      sha: shaOrBranch,
      headers: {
        // Magic to defeat caching
        'If-None-Match': '',
      },
    });
  }

  // If we wanted (and if we had a good SHA1 library) we could compute the sha
  // of the contents as described here
  // https://stackoverflow.com/questions/7225313/how-does-git-compute-file-hashes
  // And use that to check if we need to update tehe file rather than literally
  // comparing the contents. Dunno if that's much better.

  ensureFileContents(path, createMessage, updateMessage, content, branch) {
    // Depending on whether the file exists or not, we may get an object that
    // has a commit in it and the file data down a level. So we normalize things
    // and add some extra data about whether the file was updated or created. If
    // it was updated or created there will be a commit object in the returned
    // value. Note also that the file value in the returned object will only
    // have a content property if the file already existed with the same
    // contents as we wanted it to contain.
    const wrap = (file, updated, created) => {
      if ('commit' in file) {
        return { file: file.content, commit: file.commit, updated, created };
      }
      return { file, updated, created };
    };

    return this.getFile(path, branch)
      .then((file) => {
        if (decode(file.content) !== content) {
          const { sha } = file;
          return this.updateFile(path, updateMessage, content, sha, branch).then((f) =>
            wrap(f, true, false),
          );
        }
        return wrap(file, false, false);
      })
      .catch((e) => {
        if (e.status === 404) {
          return this.createFile(path, createMessage, content, branch).then((f) =>
            wrap(f, false, true),
          );
        }
        throw e;
      });
  }

  getBranch(name) {
    return this.getRef(`heads/${name}`);
  }

  branchExists(name) {
    return this.getBranch(name).then(always(true)).catch(always(false));
  }

  /*
   * Ensure branch named `name` exists. If it does not, create it by branchng
   * off of `parent`.
   */
  ensureBranch(name, parent) {
    return this.getBranch(name)
      .then((b) => ({ branch: b, created: false }))
      .catch(() => this.makeBranch(name, parent).then((b) => ({ branch: b, created: true })));
  }

  async makeBranch(name, parent) {
    const p = await this.getBranch(parent);
    return this.makeRef(`heads/${name}`, p.object.sha);
  }

  getBranchProtection(branch) {
    const { owner, name } = this;
    const url = 'GET /repos/{owner}/{name}/branches/{branch}/protection';
    return this.octokit.request(url, { owner, name, branch }).then(if200);
  }

  updateBranchProtection(branch, protections) {
    const { owner, name } = this;
    const url = 'PUT /repos/{owner}/{name}/branches/{branch}/protection';
    return this.octokit
      .request(url, {
        owner,
        name,
        branch,
        ...protections,
      })
      .then(if200);
  }

  getRef(ref) {
    const { owner, name } = this;
    const url = 'GET /repos/{owner}/{name}/git/ref/{ref}';
    return this.octokit
      .request(url, {
        owner,
        name,
        ref,
        headers: {
          // Magic to defeat caching since the actual object pointed to by the ref
          // can change if it is branch name.
          'If-None-Match': '', // Magic to defeat caching.
        },
      })
      .then(if200);
  }

  makeRef(ref, sha) {
    const { owner, name } = this;
    const url = 'POST /repos/{owner}/{name}/git/refs';
    return this.octokit.request(url, { owner, name, ref: `refs/${ref}`, sha }).then(if200);
  }

  updateRef(ref, sha) {
    const { owner, name } = this;
    const url = 'PATCH /repos/{owner}/{name}/git/refs/{ref}';
    return this.octokit.request(url, { owner, name, ref, sha, forced: true }).then(if200);
  }

  deleteRef(ref) {
    const { owner, name } = this;
    const url = 'DELETE /repos/{owner}/{name}/git/refs/{ref}';
    return this.octokit.request(url, { owner, name, ref }).then(if200);
  }

  ensureRefAtSha(ref, sha) {
    return this.getRef(ref)
      .then((existing) => {
        if (existing.object.sha !== sha) {
          return this.updateRef(ref, sha).then((moved) => ({
            ref: moved,
            moved: true,
            created: false,
          }));
        }
        return { ref: existing, moved: false, created: false };
      })
      .catch((e) => {
        if (e.status === 404) {
          return this.makeRef(ref, sha).then((r) => ({ ref: r, moved: false, created: true }));
        }
        throw e;
      });
  }

  // It seems that the process for adding a user as an admin for their own repo
  // happens asynchronously so immediately after we made the repo they may not
  // yet have the permissions needed to change the branch protection. So we'll
  // just check that it's protected. (Kinda a bummer, I guess, that we check
  // this every time they go to a new page. Hmmm.)
  tryToProtectMain() {
    return this.getBranchProtection('main')
      .then(() => true)
      .catch(() => {
        this.updateBranchProtection('main', mainBranchProtections)
          .then(() => true)
          .catch(() => false);
      });
  }
}

/*
 * Do we have an access token?
 */
const hasToken = () => getToken() !== null;

/*
 * Connect to Github, get the current user, and wrap it all up in a wrapper object.
 */
const connect = async (siteId, retries = 3) => {
  // Retry in case our token has gone bad, e.g. been revoked in which case we
  // want to forget about the one we have and try logging back in.
  if (retries > 0) {
    const octokit = await token(siteId).then((t) => new Octokit({ auth: t }));
    return octokit
      .request('GET /user')
      .then(if200)
      .then((data) => new Github(octokit, data))
      .catch((r) => {
        if (r.status === 401) {
          removeToken();
          return connect(siteId, retries - 1);
        } else {
          throw r;
        }
      });
  }
  throw new Error("Couldn't connect.");
};

export default { connect, hasToken };
